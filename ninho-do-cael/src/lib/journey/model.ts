import { addMonths, format, parseISO } from "date-fns";

import { allocateProportionally } from "@/lib/calculations/financial";
import { overallReadiness } from "@/lib/calculations/readiness";
import { isTaskOverdue } from "@/lib/tasks/views";
import {
  USAGE_PHASES,
  type Criticality,
  type DecisionStatus,
  type TaskStatus,
  type UsagePhase,
} from "@/types/domain";

/**
 * Jornada por fases (SDD, seção 22): cada fase mostra resumo, necessidades,
 * compras, tarefas, decisões, prontidão, gasto e marcos. Tudo puro — datas
 * derivadas da data prevista do parto (vinda do banco), nunca fixas no código.
 */

// ---------------------------------------------------------------------------
// Janelas e marcos por fase
// ---------------------------------------------------------------------------

export type PhaseWindow = { start: string | null; end: string | null };

/** Meses (início, fim) de cada fase em relação ao nascimento. */
const PHASE_MONTHS: Record<
  Exclude<UsagePhase, "antes_do_parto" | "continuo">,
  [number, number | null]
> = {
  meses_0_3: [0, 3],
  meses_3_6: [3, 6],
  meses_6_12: [6, 12],
  apos_12_meses: [12, null],
};

function shiftMonths(isoDate: string, months: number): string {
  return format(addMonths(parseISO(isoDate), months), "yyyy-MM-dd");
}

export function phaseWindow(phase: UsagePhase, birthDate: string): PhaseWindow {
  if (phase === "antes_do_parto") {
    return { start: null, end: birthDate };
  }
  if (phase === "continuo") {
    return { start: null, end: null };
  }
  const [fromMonths, toMonths] = PHASE_MONTHS[phase];
  return {
    start: shiftMonths(birthDate, fromMonths),
    end: toMonths === null ? null : shiftMonths(birthDate, toMonths),
  };
}

/** Marco textual da fase, calculado da data prevista (tom da seção 37). */
export function phaseMilestone(phase: UsagePhase, birthDate: string): string {
  const birth = formatShort(birthDate);
  switch (phase) {
    case "antes_do_parto":
      return `Tudo o que precisa estar pronto até ${birth}, a data prevista.`;
    case "meses_0_3":
      return `Do nascimento até ${formatShort(shiftMonths(birthDate, 3))} — chegada em casa e recém-nascido.`;
    case "meses_3_6":
      return `De ${formatShort(shiftMonths(birthDate, 3))} a ${formatShort(shiftMonths(birthDate, 6))} — Cael começa a interagir.`;
    case "meses_6_12":
      return `De ${formatShort(shiftMonths(birthDate, 6))} a ${formatShort(shiftMonths(birthDate, 12))} — introdução alimentar e mobilidade.`;
    case "apos_12_meses":
      return `A partir de ${formatShort(shiftMonths(birthDate, 12))} — primeiro aniversário em diante.`;
    case "continuo":
      return "Acompanha a família a jornada inteira, sem janela fixa.";
  }
}

function formatShort(isoDate: string): string {
  return format(parseISO(isoDate), "dd/MM/yyyy");
}

/** Fase futura: a janela ainda nem começou (itens não poluem a urgência). */
export function isFuturePhase(
  phase: UsagePhase,
  birthDate: string,
  today: string,
): boolean {
  const window = phaseWindow(phase, birthDate);
  return window.start !== null && window.start > today;
}

// ---------------------------------------------------------------------------
// Atribuição de fase a tarefas e decisões (decisão D-035)
// ---------------------------------------------------------------------------

/** Em qual fase cai uma data, em relação à data prevista do parto. */
export function phaseForDate(isoDate: string, birthDate: string): UsagePhase {
  if (isoDate < birthDate) return "antes_do_parto";
  if (isoDate < shiftMonths(birthDate, 3)) return "meses_0_3";
  if (isoDate < shiftMonths(birthDate, 6)) return "meses_3_6";
  if (isoDate < shiftMonths(birthDate, 12)) return "meses_6_12";
  return "apos_12_meses";
}

const PHASE_ORDER: Record<UsagePhase, number> = Object.fromEntries(
  USAGE_PHASES.map((phase, index) => [phase, index]),
) as Record<UsagePhase, number>;

/**
 * Fase de uma tarefa/decisão: a fase mais cedo entre as necessidades
 * vinculadas; sem vínculo, deriva do prazo; sem prazo, "continuo".
 */
export function phaseForLinked(
  linkedPhases: UsagePhase[],
  dueDate: string | null,
  birthDate: string,
): UsagePhase {
  if (linkedPhases.length > 0) {
    return [...linkedPhases].sort(
      (a, b) => PHASE_ORDER[a] - PHASE_ORDER[b],
    )[0]!;
  }
  if (dueDate) {
    return phaseForDate(dueDate, birthDate);
  }
  return "continuo";
}

// ---------------------------------------------------------------------------
// Agregação por fase
// ---------------------------------------------------------------------------

export type JourneyNeed = {
  phase: UsagePhase;
  criticality: Criticality;
  /** 0..1 (seção 10.3), já calculada. */
  readiness: number;
  archived: boolean;
};

export type JourneyTask = {
  phase: UsagePhase;
  status: TaskStatus;
  dueDate: string | null;
};

export type JourneyDecision = {
  phase: UsagePhase;
  status: DecisionStatus;
};

export type JourneyPurchase = {
  status: string;
  total: number;
  returnedAmount: number;
  /** Itens com a fase da necessidade vinculada (null sem vínculo). */
  items: Array<{ allocatedTotal: number; phase: UsagePhase | null }>;
};

/** Status de compra que contam dinheiro na jornada (mesmo conjunto da 10.7). */
const SPENT_STATUSES = new Set([
  "confirmada",
  "aguardando_envio",
  "enviada",
  "entregue_parcial",
  "entregue",
  "devolvida",
]);

export type PhaseSummary = {
  phase: UsagePhase;
  window: PhaseWindow;
  milestone: string;
  future: boolean;
  needs: { total: number; ready: number; readiness: number };
  tasks: { total: number; done: number; blocked: number; overdue: number };
  decisions: { total: number; decided: number; awaitingProfessional: number };
  purchases: { count: number; spent: number };
};

export type Journey = {
  phases: PhaseSummary[];
  /** Gasto de itens de compra sem necessidade vinculada (não some dinheiro). */
  unassignedSpent: number;
};

export function buildJourney(input: {
  needs: JourneyNeed[];
  tasks: JourneyTask[];
  decisions: JourneyDecision[];
  purchases: JourneyPurchase[];
  birthDate: string;
  today: string;
}): Journey {
  const spentByPhase = new Map<UsagePhase, number>();
  const purchasesByPhase = new Map<UsagePhase, Set<number>>();
  let unassignedSpent = 0;

  input.purchases.forEach((purchase, purchaseIndex) => {
    if (!SPENT_STATUSES.has(purchase.status)) return;
    if (purchase.items.length === 0) return;
    // Devolução abate proporcionalmente ao rateio dos itens (Hamilton),
    // mantendo a soma das fases igual ao comprometido da compra.
    const refunds = allocateProportionally(
      Math.min(purchase.returnedAmount, purchase.total),
      purchase.items.map((item) => item.allocatedTotal),
    );
    purchase.items.forEach((item, itemIndex) => {
      const net = Math.max(item.allocatedTotal - (refunds[itemIndex] ?? 0), 0);
      if (item.phase === null) {
        unassignedSpent += net;
        return;
      }
      spentByPhase.set(item.phase, (spentByPhase.get(item.phase) ?? 0) + net);
      const set = purchasesByPhase.get(item.phase) ?? new Set<number>();
      set.add(purchaseIndex);
      purchasesByPhase.set(item.phase, set);
    });
  });

  const phases = USAGE_PHASES.map((phase): PhaseSummary => {
    const needs = input.needs.filter(
      (need) => !need.archived && need.phase === phase,
    );
    const tasks = input.tasks.filter((task) => task.phase === phase);
    const decisions = input.decisions.filter(
      (decision) => decision.phase === phase,
    );
    return {
      phase,
      window: phaseWindow(phase, input.birthDate),
      milestone: phaseMilestone(phase, input.birthDate),
      future: isFuturePhase(phase, input.birthDate, input.today),
      needs: {
        total: needs.length,
        ready: needs.filter((need) => need.readiness >= 1).length,
        readiness: overallReadiness(needs),
      },
      tasks: {
        total: tasks.length,
        done: tasks.filter((task) => task.status === "concluida").length,
        blocked: tasks.filter((task) => task.status === "bloqueada").length,
        overdue: tasks.filter((task) => isTaskOverdue(task, input.today))
          .length,
      },
      decisions: {
        total: decisions.length,
        decided: decisions.filter((decision) => decision.status === "decidida")
          .length,
        awaitingProfessional: decisions.filter(
          (decision) => decision.status === "aguardando_profissional",
        ).length,
      },
      purchases: {
        count: purchasesByPhase.get(phase)?.size ?? 0,
        spent: round2(spentByPhase.get(phase) ?? 0),
      },
    };
  });

  return { phases, unassignedSpent: round2(unassignedSpent) };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
