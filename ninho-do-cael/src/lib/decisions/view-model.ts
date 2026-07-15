import type { DecisionRow } from "@/server/repositories/decisions-repository";
import type {
  DecisionConfidence,
  DecisionStatus,
  DecisionType,
  ResponsibleParty,
} from "@/types/domain";

/** Decisão pronta para a interface (seção 21). */
export type DecisionItem = {
  id: string;
  title: string;
  type: DecisionType;
  status: DecisionStatus;
  responsible: ResponsibleParty;
  confidence: DecisionConfidence | null;
  decidedAt: string | null;
  dueDate: string | null;
  conclusion: string | null;
  rationale: string | null;
  source: string | null;
  impact: string | null;
  pendingQuestion: string | null;
  needs: Array<{ id: string; title: string }>;
  createdAt: string;
};

export function buildDecisionItem(row: DecisionRow): DecisionItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type as DecisionType,
    status: row.status as DecisionStatus,
    responsible: row.responsible as ResponsibleParty,
    confidence: (row.confidence as DecisionConfidence | null) ?? null,
    decidedAt: row.decided_at,
    dueDate: row.due_date,
    conclusion: row.conclusion,
    rationale: row.rationale,
    source: row.source,
    impact: row.impact,
    pendingQuestion: row.pending_question,
    needs: (row.need_decisions ?? []).map((link) => ({
      id: link.need.id,
      title: link.need.title,
    })),
    createdAt: row.created_at,
  };
}
