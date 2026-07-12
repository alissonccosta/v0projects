import { isOverdue, productNeedReadiness } from "@/lib/calculations/readiness";
import type { FilterableNeed } from "@/lib/needs/filters";
import type { NeedRow } from "@/server/repositories/needs-repository";
import type {
  AcquisitionStatus,
  Category,
  Criticality,
  LogisticsStatus,
  NeedAudience,
  NeedDecisionStatus,
  NeedType,
  Priority,
  ReadinessStatus,
  ResponsibleParty,
  SyncStatus,
  UsagePhase,
} from "@/types/domain";

/** Necessidade pronta para a interface: linha do banco + cálculos da seção 10. */
export type NeedViewModel = {
  id: string;
  title: string;
  type: NeedType;
  audience: NeedAudience;
  category: Category;
  priority: Priority;
  criticality: Criticality;
  phase: UsagePhase;
  decisionStatus: NeedDecisionStatus;
  acquisitionStatus: AcquisitionStatus;
  logisticsStatus: LogisticsStatus;
  readinessStatus: ReadinessStatus;
  responsible: ResponsibleParty;
  requiredQuantity: number | null;
  availableQuantity: number | null;
  unit: string | null;
  estimatedPrice: number | null;
  paidPrice: number | null;
  dueDate: string | null;
  auditNotes: string | null;
  originalContent: string | null;
  originalNotionUrl: string | null;
  syncStatus: SyncStatus;
  archivedAt: string | null;
  updatedAt: string;
  /** 0..1 conforme seção 10.3. */
  readiness: number;
  /** Seção 10.6, relativa a `today`. */
  overdue: boolean;
};

export function buildNeedViewModel(row: NeedRow, today: string): NeedViewModel {
  const filterable = rowToFilterable(row);
  const readiness = productNeedReadiness(filterable);
  return {
    id: row.id,
    title: row.title,
    type: row.type as NeedType,
    audience: row.audience as NeedAudience,
    category: row.category as Category,
    priority: row.priority as Priority,
    criticality: row.criticality as Criticality,
    phase: row.phase as UsagePhase,
    decisionStatus: row.decision_status as NeedDecisionStatus,
    acquisitionStatus: row.acquisition_status as AcquisitionStatus,
    logisticsStatus: row.logistics_status as LogisticsStatus,
    readinessStatus: row.readiness_status as ReadinessStatus,
    responsible: row.responsible as ResponsibleParty,
    requiredQuantity: row.required_quantity,
    availableQuantity: row.available_quantity,
    unit: row.unit,
    estimatedPrice: row.estimated_price,
    paidPrice: row.paid_price,
    dueDate: row.due_date,
    auditNotes: row.audit_notes,
    originalContent: row.original_content,
    originalNotionUrl: row.original_notion_url,
    syncStatus: row.sync_status as SyncStatus,
    archivedAt: row.archived_at,
    updatedAt: row.updated_at,
    readiness,
    overdue: isOverdue({
      dueDate: row.due_date,
      today,
      decisionStatus: row.decision_status as NeedDecisionStatus,
      readiness,
    }),
  };
}

export function rowToFilterable(row: NeedRow): FilterableNeed {
  return {
    id: row.id,
    title: row.title,
    category: row.category as Category,
    phase: row.phase as UsagePhase,
    criticality: row.criticality as Criticality,
    responsible: row.responsible as ResponsibleParty,
    dueDate: row.due_date,
    archivedAt: row.archived_at,
    decisionStatus: row.decision_status as NeedDecisionStatus,
    acquisitionStatus: row.acquisition_status as AcquisitionStatus,
    logisticsStatus: row.logistics_status as LogisticsStatus,
    readinessStatus: row.readiness_status as ReadinessStatus,
    requiredQuantity: row.required_quantity,
    availableQuantity: row.available_quantity,
  };
}

export function viewModelToFilterable(need: NeedViewModel): FilterableNeed {
  return {
    id: need.id,
    title: need.title,
    category: need.category,
    phase: need.phase,
    criticality: need.criticality,
    responsible: need.responsible,
    dueDate: need.dueDate,
    archivedAt: need.archivedAt,
    decisionStatus: need.decisionStatus,
    acquisitionStatus: need.acquisitionStatus,
    logisticsStatus: need.logisticsStatus,
    readinessStatus: need.readinessStatus,
    requiredQuantity: need.requiredQuantity,
    availableQuantity: need.availableQuantity,
  };
}
