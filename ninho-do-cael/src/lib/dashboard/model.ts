import { differenceInCalendarDays, parseISO } from "date-fns";

import {
  committedTotal,
  hasTotalDivergence,
  netAllocatedItemTotals,
  pendingEstimateTotal,
  savingsTotal,
} from "@/lib/calculations/financial";
import { overallReadiness } from "@/lib/calculations/readiness";
import { formatDateBR } from "@/lib/formatters/date";
import { phaseForDate, phaseWindow } from "@/lib/journey/model";
import { CATEGORY_LABELS, PHASE_LABELS } from "@/lib/labels";
import {
  CATEGORIES,
  PURCHASE_STATUSES,
  USAGE_PHASES,
  type AcquisitionStatus,
  type Category,
  type Criticality,
  type DecisionStatus,
  type DecisionType,
  type NeedDecisionStatus,
  type Priority,
  type PurchaseStatus,
  type ReadinessStatus,
  type ResponsibleParty,
  type TaskStatus,
  type UsagePhase,
} from "@/types/domain";

/**
 * Agregados do painel (SDD, seção 15). Funções puras: o painel responde
 * "como estamos?" e "o que fazer agora?" com números calculados dos dados —
 * nunca fixos no código (seção 1.4).
 */

// ---------------------------------------------------------------------------
// Entradas mínimas (a API mapeia as linhas do banco para estes formatos)
// ---------------------------------------------------------------------------

export type DashboardNeed = {
  id: string;
  title: string;
  category: Category;
  phase: UsagePhase;
  criticality: Criticality;
  priority: Priority;
  responsible: ResponsibleParty;
  decisionStatus: NeedDecisionStatus;
  acquisitionStatus: AcquisitionStatus;
  requiredQuantity: number | null;
  availableQuantity: number | null;
  estimatedPrice: number | null;
  dueDate: string | null;
  /** 0..1 (seção 10.3) já calculada. */
  readiness: number;
  overdue: boolean;
  archived: boolean;
  updatedAt: string;
};

export type DashboardTask = {
  id: string;
  title: string;
  status: TaskStatus;
  responsible: ResponsibleParty;
  dueDate: string | null;
  blockedReason: string | null;
  dependencyTitle: string | null;
  updatedAt: string;
};

export type DashboardDecision = {
  id: string;
  title: string;
  type: DecisionType;
  status: DecisionStatus;
  responsible: ResponsibleParty;
  dueDate: string | null;
  updatedAt: string;
};

export type DashboardPurchase = {
  id: string;
  title: string;
  status: PurchaseStatus;
  supplier: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  returnedAmount: number;
  expectedDeliveryAt: string | null;
  items: Array<{ allocatedTotal: number; category: Category | null }>;
};

export type DashboardInventoryItem = {
  id: string;
  readinessStatus: ReadinessStatus;
};

// ---------------------------------------------------------------------------
// 15.2/15.3 — contagem regressiva (sem virar previsão médica)
// ---------------------------------------------------------------------------

export type Countdown = {
  birthDate: string;
  /** Dias de hoje até a data prevista (negativo depois dela). */
  daysRemaining: number;
  /** Fase corrente da jornada em relação à data prevista. */
  phase: UsagePhase;
  /** Próximo marco em texto (derivado, nunca fixo). */
  nextMilestone: string | null;
};

export function buildCountdown(birthDate: string, today: string): Countdown {
  const phase = phaseForDate(today, birthDate);
  const window = phaseWindow(phase, birthDate);
  let nextMilestone: string | null = null;
  if (phase === "antes_do_parto") {
    nextMilestone = `Data prevista da cesárea: ${formatDateBR(birthDate)}`;
  } else if (window.end) {
    nextMilestone = `Próxima fase começa em ${formatDateBR(window.end)}`;
  }
  return {
    birthDate,
    daysRemaining: differenceInCalendarDays(
      parseISO(birthDate),
      parseISO(today),
    ),
    phase,
    nextMilestone,
  };
}

// ---------------------------------------------------------------------------
// 15.3 — prontidão e financeiro
// ---------------------------------------------------------------------------

/** Fases que contam para "antes do parto" (mesmo conjunto da 10.8). */
const UNTIL_BIRTH_PHASES = new Set<UsagePhase>(["antes_do_parto", "continuo"]);

export type ReadinessBlock = {
  /** 0..1 ponderada por criticidade (10.5). */
  overall: number;
  beforeBirth: number;
  criticalPending: number;
  totalActive: number;
};

export function buildReadinessBlock(needs: DashboardNeed[]): ReadinessBlock {
  const active = needs.filter((need) => !need.archived);
  const beforeBirth = active.filter((need) =>
    UNTIL_BIRTH_PHASES.has(need.phase),
  );
  return {
    overall: overallReadiness(active),
    beforeBirth: overallReadiness(beforeBirth),
    criticalPending: active.filter(
      (need) => need.criticality === "critica" && need.readiness < 1,
    ).length,
    totalActive: active.length,
  };
}

/** Compras que ainda vão virar entrega. */
const AWAITING_DELIVERY = new Set<PurchaseStatus>([
  "confirmada",
  "aguardando_envio",
  "enviada",
  "entregue_parcial",
]);

export type FinancialBlock = {
  paid: number;
  pendingEstimate: number;
  pendingEstimateUntilBirth: number;
  savings: number;
  awaitingDelivery: number;
};

export function buildFinancialBlock(
  purchases: DashboardPurchase[],
  needs: DashboardNeed[],
): FinancialBlock {
  const financial = purchases.map((purchase) => ({
    status: purchase.status,
    total: purchase.total,
    discount: purchase.discount,
    returnedAmount: purchase.returnedAmount,
  }));
  const estimate = needs.map((need) => ({
    acquisitionStatus: need.acquisitionStatus,
    phase: need.phase,
    estimatedPrice: need.estimatedPrice,
    archived: need.archived,
  }));
  return {
    paid: committedTotal(financial),
    pendingEstimate: pendingEstimateTotal(estimate, "total"),
    pendingEstimateUntilBirth: pendingEstimateTotal(estimate, "ate_o_parto"),
    savings: savingsTotal(financial),
    awaitingDelivery: purchases.filter((purchase) =>
      AWAITING_DELIVERY.has(purchase.status),
    ).length,
  };
}

// ---------------------------------------------------------------------------
// 15.4 — próximas ações
// ---------------------------------------------------------------------------

export type NextActionReason =
  "vencido" | "critico" | "prazo" | "bloqueador" | "prioridade" | "restante";

export type NextAction = {
  kind: "necessidade" | "tarefa" | "decisao";
  id: string;
  title: string;
  href: string;
  reasonKey: NextActionReason;
  reason: string;
  responsible: ResponsibleParty;
  dueDate: string | null;
  dependency: string | null;
  updatedAt: string;
};

const ACTIVE_TASK = new Set<TaskStatus>([
  "planejada",
  "em_andamento",
  "bloqueada",
]);
const OPEN_DECISION = new Set<DecisionStatus>([
  "pendente",
  "em_analise",
  "aguardando_profissional",
  "revisar_depois",
]);

function isTaskOverdueSimple(task: DashboardTask, today: string): boolean {
  return (
    task.dueDate !== null &&
    task.dueDate < today &&
    ACTIVE_TASK.has(task.status)
  );
}

function byDueThenTitle(a: NextAction, b: NextAction): number {
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  if (a.dueDate && !b.dueDate) return -1;
  if (!a.dueDate && b.dueDate) return 1;
  return a.title.localeCompare(b.title, "pt-BR");
}

/** Prazo "próximo": até 7 dias à frente (inclusive). */
function isDueSoon(dueDate: string | null, today: string): boolean {
  if (!dueDate || dueDate < today) return false;
  return differenceInCalendarDays(parseISO(dueDate), parseISO(today)) <= 7;
}

export function buildNextActions(
  input: {
    needs: DashboardNeed[];
    tasks: DashboardTask[];
    decisions: DashboardDecision[];
  },
  today: string,
  limit = 8,
): NextAction[] {
  const needs = input.needs.filter((need) => !need.archived);
  const pendingNeeds = needs.filter((need) => need.readiness < 1);
  const activeTasks = input.tasks.filter((task) =>
    ACTIVE_TASK.has(task.status),
  );
  const openDecisions = input.decisions.filter((decision) =>
    OPEN_DECISION.has(decision.status),
  );

  const needAction = (
    need: DashboardNeed,
    reasonKey: NextActionReason,
    reason: string,
  ): NextAction => ({
    kind: "necessidade",
    id: need.id,
    title: need.title,
    href: `/app/necessidades/${need.id}`,
    reasonKey,
    reason,
    responsible: need.responsible,
    dueDate: need.dueDate,
    dependency: null,
    updatedAt: need.updatedAt,
  });
  const taskAction = (
    task: DashboardTask,
    reasonKey: NextActionReason,
    reason: string,
  ): NextAction => ({
    kind: "tarefa",
    id: task.id,
    title: task.title,
    href: `/app/tarefas/${task.id}`,
    reasonKey,
    reason,
    responsible: task.responsible,
    dueDate: task.dueDate,
    dependency: task.dependencyTitle ?? task.blockedReason,
    updatedAt: task.updatedAt,
  });
  const decisionAction = (
    decision: DashboardDecision,
    reasonKey: NextActionReason,
    reason: string,
  ): NextAction => ({
    kind: "decisao",
    id: decision.id,
    title: decision.title,
    href: `/app/decisoes/${decision.id}`,
    reasonKey,
    reason,
    responsible: decision.responsible,
    dueDate: decision.dueDate,
    dependency: null,
    updatedAt: decision.updatedAt,
  });

  const buckets: NextAction[][] = [
    // 1. Vencidos
    [
      ...pendingNeeds
        .filter((need) => need.overdue)
        .map((need) =>
          needAction(
            need,
            "vencido",
            `Vencida desde ${formatDateBR(need.dueDate!)}`,
          ),
        ),
      ...activeTasks
        .filter((task) => isTaskOverdueSimple(task, today))
        .map((task) =>
          taskAction(
            task,
            "vencido",
            `Vencida desde ${formatDateBR(task.dueDate!)}`,
          ),
        ),
      ...openDecisions
        .filter((decision) => decision.dueDate && decision.dueDate < today)
        .map((decision) =>
          decisionAction(
            decision,
            "vencido",
            `Prazo passou em ${formatDateBR(decision.dueDate!)}`,
          ),
        ),
    ],
    // 2. Críticos pendentes
    pendingNeeds
      .filter((need) => need.criticality === "critica")
      .map((need) =>
        needAction(
          need,
          "critico",
          `Crítica com prontidão em ${Math.round(need.readiness * 100)}%`,
        ),
      ),
    // 3. Prazo próximo (7 dias)
    [
      ...pendingNeeds
        .filter((need) => isDueSoon(need.dueDate, today))
        .map((need) =>
          needAction(need, "prazo", `Prazo em ${formatDateBR(need.dueDate!)}`),
        ),
      ...activeTasks
        .filter((task) => isDueSoon(task.dueDate, today))
        .map((task) =>
          taskAction(task, "prazo", `Prazo em ${formatDateBR(task.dueDate!)}`),
        ),
      ...openDecisions
        .filter((decision) => isDueSoon(decision.dueDate, today))
        .map((decision) =>
          decisionAction(
            decision,
            "prazo",
            `Prazo em ${formatDateBR(decision.dueDate!)}`,
          ),
        ),
    ],
    // 4. Bloqueadores
    [
      ...activeTasks
        .filter((task) => task.status === "bloqueada")
        .map((task) =>
          taskAction(
            task,
            "bloqueador",
            task.dependencyTitle
              ? `Bloqueada por “${task.dependencyTitle}”`
              : "Bloqueada — destrave para seguir",
          ),
        ),
      ...openDecisions
        .filter((decision) => decision.status === "aguardando_profissional")
        .map((decision) =>
          decisionAction(
            decision,
            "bloqueador",
            "Aguardando orientação profissional",
          ),
        ),
    ],
    // 5. Alta prioridade
    pendingNeeds
      .filter((need) => need.priority === "alta")
      .map((need) => needAction(need, "prioridade", "Prioridade alta")),
    // 6. Restante: pendentes por criticidade
    pendingNeeds.map((need) =>
      needAction(
        need,
        "restante",
        `Prontidão em ${Math.round(need.readiness * 100)}%`,
      ),
    ),
  ];

  const seen = new Set<string>();
  const result: NextAction[] = [];
  for (const bucket of buckets) {
    bucket.sort(byDueThenTitle);
    for (const action of bucket) {
      const key = `${action.kind}:${action.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(action);
      if (result.length >= limit) return result;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// 15.5 — alertas acionáveis
// ---------------------------------------------------------------------------

export type DashboardAlert = {
  key:
    | "decisao_medica"
    | "compra_sem_entrega"
    | "entregue_sem_preparo"
    | "tarefa_bloqueada"
    | "quantidade_insuficiente"
    | "conflito"
    | "pedido_atrasado"
    | "custo_divergente";
  severity: "danger" | "warning";
  count: number;
  title: string;
  description: string;
  href: string;
};

const PREPARATION_PENDING = new Set<ReadinessStatus>([
  "precisa_higienizar",
  "precisa_lavar",
  "precisa_esterilizar",
  "precisa_arejar",
  "precisa_montar",
  "precisa_instalar",
  "precisa_configurar",
  "precisa_validar",
]);

const UNDELIVERED = new Set<PurchaseStatus>([
  "confirmada",
  "aguardando_envio",
  "enviada",
  "entregue_parcial",
]);

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

export function buildAlerts(
  input: {
    needs: DashboardNeed[];
    tasks: DashboardTask[];
    decisions: DashboardDecision[];
    purchases: DashboardPurchase[];
    inventory: DashboardInventoryItem[];
    openSyncConflicts: number;
  },
  today: string,
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const needs = input.needs.filter((need) => !need.archived);

  const medical = input.decisions.filter(
    (decision) =>
      decision.type === "medica" && OPEN_DECISION.has(decision.status),
  ).length;
  if (medical > 0) {
    alerts.push({
      key: "decisao_medica",
      severity: "danger",
      count: medical,
      title: `${medical} ${plural(medical, "decisão médica em aberto", "decisões médicas em aberto")}`,
      description:
        "Dependem de orientação profissional — sem pressa artificial.",
      href: "/app/decisoes",
    });
  }

  const lateOrders = input.purchases.filter(
    (purchase) =>
      UNDELIVERED.has(purchase.status) &&
      purchase.expectedDeliveryAt !== null &&
      purchase.expectedDeliveryAt < today,
  ).length;
  if (lateOrders > 0) {
    alerts.push({
      key: "pedido_atrasado",
      severity: "danger",
      count: lateOrders,
      title: `${lateOrders} ${plural(lateOrders, "pedido passou da previsão", "pedidos passaram da previsão")}`,
      description: "Vale conferir o rastreio ou cobrar a loja.",
      href: "/app/compras",
    });
  }

  const blocked = input.tasks.filter(
    (task) => task.status === "bloqueada",
  ).length;
  if (blocked > 0) {
    alerts.push({
      key: "tarefa_bloqueada",
      severity: "warning",
      count: blocked,
      title: `${blocked} ${plural(blocked, "tarefa bloqueada", "tarefas bloqueadas")}`,
      description: "Cada uma mostra a ação para destravar.",
      href: "/app/tarefas?view=bloqueadas",
    });
  }

  const divergent = input.purchases.filter((purchase) =>
    hasTotalDivergence(
      purchase.total,
      purchase.subtotal,
      purchase.discount,
      purchase.shipping,
    ),
  ).length;
  if (divergent > 0) {
    alerts.push({
      key: "custo_divergente",
      severity: "warning",
      count: divergent,
      title: `${divergent} ${plural(divergent, "compra com valores divergentes", "compras com valores divergentes")}`,
      description: "Total não bate com subtotal − desconto + frete.",
      href: "/app/compras",
    });
  }

  const undelivered = input.purchases.filter((purchase) =>
    UNDELIVERED.has(purchase.status),
  ).length;
  if (undelivered > 0) {
    alerts.push({
      key: "compra_sem_entrega",
      severity: "warning",
      count: undelivered,
      title: `${undelivered} ${plural(undelivered, "compra aguardando entrega", "compras aguardando entrega")}`,
      description: "Confirme as entregas para atualizar estoque e prontidão.",
      href: "/app/compras",
    });
  }

  const needsPreparation = input.inventory.filter((item) =>
    PREPARATION_PENDING.has(item.readinessStatus),
  ).length;
  if (needsPreparation > 0) {
    alerts.push({
      key: "entregue_sem_preparo",
      severity: "warning",
      count: needsPreparation,
      title: `${needsPreparation} ${plural(needsPreparation, "item entregue precisa de preparo", "itens entregues precisam de preparo")}`,
      description: "Lavar, montar ou instalar antes de contar como pronto.",
      href: "/app/estoque",
    });
  }

  const insufficient = needs.filter(
    (need) =>
      (need.acquisitionStatus === "comprado" ||
        need.acquisitionStatus === "ja_possui") &&
      (need.requiredQuantity ?? 0) > 0 &&
      (need.availableQuantity ?? 0) < (need.requiredQuantity ?? 0),
  ).length;
  if (insufficient > 0) {
    alerts.push({
      key: "quantidade_insuficiente",
      severity: "warning",
      count: insufficient,
      title: `${insufficient} ${plural(insufficient, "necessidade com quantidade abaixo do necessário", "necessidades com quantidade abaixo do necessário")}`,
      description: "Compradas, mas ainda faltam unidades.",
      href: "/app/necessidades?somentePendencias=1",
    });
  }

  if (input.openSyncConflicts > 0) {
    alerts.push({
      key: "conflito",
      severity: "warning",
      count: input.openSyncConflicts,
      title: `${input.openSyncConflicts} ${plural(input.openSyncConflicts, "conflito de sincronização aberto", "conflitos de sincronização abertos")}`,
      description: "Resolver na integração com o Notion.",
      href: "/app/configuracoes",
    });
  }

  return alerts;
}

// ---------------------------------------------------------------------------
// 15.6 — dados dos gráficos
// ---------------------------------------------------------------------------

export type CategoryReadinessDatum = {
  category: Category;
  label: string;
  /** 0..100 para o eixo. */
  percent: number;
  total: number;
};

export function readinessByCategory(
  needs: DashboardNeed[],
): CategoryReadinessDatum[] {
  const active = needs.filter((need) => !need.archived);
  return CATEGORIES.map((category) => {
    const inCategory = active.filter((need) => need.category === category);
    return {
      category,
      label: CATEGORY_LABELS[category],
      percent: Math.round(overallReadiness(inCategory) * 100),
      total: inCategory.length,
    };
  }).filter((datum) => datum.total > 0);
}

export type CategorySpendDatum = {
  category: Category | null;
  label: string;
  amount: number;
};

export function spendByCategory(
  purchases: DashboardPurchase[],
): CategorySpendDatum[] {
  const totals = new Map<Category | null, number>();
  for (const purchase of purchases) {
    const nets = netAllocatedItemTotals(purchase);
    purchase.items.forEach((item, index) => {
      const key = item.category;
      totals.set(
        key,
        Math.round(((totals.get(key) ?? 0) + (nets[index] ?? 0)) * 100) / 100,
      );
    });
  }
  return [...totals.entries()]
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category,
      label: category ? CATEGORY_LABELS[category] : "Sem vínculo",
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export type PurchaseStatusDatum = {
  status: PurchaseStatus;
  label: string;
  count: number;
};

export function purchasesByStatus(
  purchases: DashboardPurchase[],
  statusLabel: (status: PurchaseStatus) => string,
): PurchaseStatusDatum[] {
  return PURCHASE_STATUSES.map((status) => ({
    status,
    label: statusLabel(status),
    count: purchases.filter((purchase) => purchase.status === status).length,
  })).filter((datum) => datum.count > 0);
}

export type PhaseScheduleDatum = {
  phase: UsagePhase;
  label: string;
  total: number;
  ready: number;
};

export function scheduleByPhase(needs: DashboardNeed[]): PhaseScheduleDatum[] {
  const active = needs.filter((need) => !need.archived);
  return USAGE_PHASES.map((phase) => {
    const inPhase = active.filter((need) => need.phase === phase);
    return {
      phase,
      label: PHASE_LABELS[phase],
      total: inPhase.length,
      ready: inPhase.filter((need) => need.readiness >= 1).length,
    };
  }).filter((datum) => datum.total > 0);
}
