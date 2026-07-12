import type {
  AcquisitionStatus,
  Criticality,
  DecisionStatus,
  LogisticsStatus,
  NeedDecisionStatus,
  ReadinessStatus,
  TaskStatus,
} from "@/types/domain";

/**
 * Cálculos de prontidão (SDD, seção 10). Funções puras, sem acesso a dados —
 * alimentam necessidades (Fase 3), estoque (Fase 4) e o painel (Fase 6).
 */

/** 10.2 — coverage = min(available / required, 1). */
export function quantityCoverage(
  requiredQuantity: number | null | undefined,
  availableQuantity: number | null | undefined,
): number {
  if (!requiredQuantity || requiredQuantity <= 0) {
    // Sem quantidade exigida, cobertura não restringe a prontidão.
    return 1;
  }
  const available = Math.max(availableQuantity ?? 0, 0);
  return Math.min(available / requiredQuantity, 1);
}

/** 10.3 — decisão resolvida vale a parcela de 20%. */
export function isDecisionResolved(status: NeedDecisionStatus): boolean {
  return status === "escolhido" || status === "descartado";
}

/** 10.3 — aquisição adequada vale a parcela de 25%. */
export function isAcquisitionSettled(status: AcquisitionStatus): boolean {
  return (
    status === "comprado" || status === "ja_possui" || status === "nao_comprar"
  );
}

/** 10.3 — logística concluída vale a parcela de 20%. */
export function isLogisticsComplete(status: LogisticsStatus): boolean {
  return status === "entregue" || status === "nao_aplicavel";
}

/** 10.3 — prontidão física concluída vale a parcela de 20%. */
export function isPhysicallyReady(status: ReadinessStatus): boolean {
  return status === "pronto_para_uso" || status === "nao_aplicavel";
}

export type ProductNeedInput = {
  decisionStatus: NeedDecisionStatus;
  acquisitionStatus: AcquisitionStatus;
  logisticsStatus: LogisticsStatus;
  readinessStatus: ReadinessStatus;
  requiredQuantity: number | null;
  availableQuantity: number | null;
};

/**
 * 10.3 — prontidão de produto/consumível:
 * decisão 20% · aquisição 25% · logística 20% · quantidade 15% · física 20%.
 */
export function productNeedReadiness(input: ProductNeedInput): number {
  const decision = isDecisionResolved(input.decisionStatus) ? 0.2 : 0;
  const acquisition = isAcquisitionSettled(input.acquisitionStatus) ? 0.25 : 0;
  const logistics = isLogisticsComplete(input.logisticsStatus) ? 0.2 : 0;
  const quantity =
    0.15 * quantityCoverage(input.requiredQuantity, input.availableQuantity);
  const physical = isPhysicallyReady(input.readinessStatus) ? 0.2 : 0;
  return round4(decision + acquisition + logistics + quantity + physical);
}

/** 10.3 — prontidão de tarefa/serviço. */
export function taskReadiness(
  status: TaskStatus,
  options: { substituted?: boolean } = {},
): number | null {
  switch (status) {
    case "planejada":
      return 0;
    case "em_andamento":
      return 0.5;
    case "bloqueada":
      return 0.2;
    case "concluida":
      return 1;
    case "cancelada":
      // Excluída do cálculo quando substituída; senão conta como 0.
      return options.substituted ? null : 0;
  }
}

/** 10.3 — prontidão de decisão. */
export function decisionReadiness(status: DecisionStatus): number {
  switch (status) {
    case "pendente":
      return 0;
    case "em_analise":
    case "aguardando_profissional":
      return 0.35;
    case "decidida":
      return 1;
    case "revisar_depois":
      return 0.6;
    case "descartada":
      // Encerrada conscientemente conta como resolvida.
      return 1;
  }
}

/** 10.4 — peso por criticidade. */
export const CRITICALITY_WEIGHTS: Record<Criticality, number> = {
  critica: 5,
  alta: 3,
  media: 2,
  baixa: 1,
};

export type WeightedItem = {
  readiness: number;
  criticality: Criticality;
};

/** 10.5 — prontidão geral ponderada por criticidade. */
export function overallReadiness(items: WeightedItem[]): number {
  if (items.length === 0) {
    return 0;
  }
  let weightedSum = 0;
  let weightTotal = 0;
  for (const item of items) {
    const weight = CRITICALITY_WEIGHTS[item.criticality];
    weightedSum += item.readiness * weight;
    weightTotal += weight;
  }
  return round4(weightedSum / weightTotal);
}

export type OverdueInput = {
  dueDate: string | null;
  today: string;
  decisionStatus?: NeedDecisionStatus;
  readiness: number;
};

/**
 * 10.6 — item vencido: data anterior à atual, não concluído, não descartado
 * e não pronto.
 */
export function isOverdue(input: OverdueInput): boolean {
  if (!input.dueDate) {
    return false;
  }
  if (input.dueDate >= input.today) {
    return false;
  }
  if (input.decisionStatus === "descartado") {
    return false;
  }
  return input.readiness < 1;
}

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
