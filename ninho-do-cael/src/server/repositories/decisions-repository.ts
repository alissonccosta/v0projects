import type { SupabaseClient } from "@supabase/supabase-js";

/** Acesso a dados de decisões (seção 21). */

export type DecisionRow = {
  id: string;
  household_id: string;
  title: string;
  type: string;
  status: string;
  responsible: string;
  confidence: string | null;
  decided_at: string | null;
  due_date: string | null;
  conclusion: string | null;
  rationale: string | null;
  source: string | null;
  impact: string | null;
  pending_question: string | null;
  original_content: string | null;
  sync_status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  need_decisions?: Array<{
    need: { id: string; title: string; phase: string };
  }>;
};

const DECISION_COLUMNS =
  "id, household_id, title, type, status, responsible, confidence, decided_at, " +
  "due_date, conclusion, rationale, source, impact, pending_question, " +
  "original_content, sync_status, archived_at, created_at, updated_at";

const DECISION_WITH_NEEDS = `${DECISION_COLUMNS}, need_decisions(need:needs(id, title, phase))`;

export async function listDecisions(
  supabase: SupabaseClient,
): Promise<DecisionRow[]> {
  const { data, error } = await supabase
    .from("decisions")
    .select(DECISION_WITH_NEEDS)
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(`Falha ao listar decisões: ${error.message}`);
  }
  return (data ?? []) as unknown as DecisionRow[];
}

export async function getDecisionById(
  supabase: SupabaseClient,
  id: string,
): Promise<DecisionRow | null> {
  const { data, error } = await supabase
    .from("decisions")
    .select(DECISION_WITH_NEEDS)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(`Falha ao carregar a decisão: ${error.message}`);
  }
  return (data as unknown as DecisionRow) ?? null;
}

export async function insertDecision(
  supabase: SupabaseClient,
  values: Record<string, unknown>,
): Promise<DecisionRow> {
  const { data, error } = await supabase
    .from("decisions")
    .insert(values)
    .select(DECISION_COLUMNS)
    .single();
  if (error) {
    throw new Error(`Falha ao criar a decisão: ${error.message}`);
  }
  return data as unknown as DecisionRow;
}

export async function updateDecisionRow(
  supabase: SupabaseClient,
  id: string,
  patch: Record<string, unknown>,
): Promise<DecisionRow> {
  const { data, error } = await supabase
    .from("decisions")
    .update(patch)
    .eq("id", id)
    .select(DECISION_COLUMNS)
    .single();
  if (error) {
    throw new Error(`Falha ao atualizar a decisão: ${error.message}`);
  }
  return data as unknown as DecisionRow;
}

/** Substitui os vínculos decisão↔necessidade pelo conjunto informado. */
export async function setDecisionNeeds(
  supabase: SupabaseClient,
  householdId: string,
  decisionId: string,
  needIds: string[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("need_decisions")
    .delete()
    .eq("decision_id", decisionId);
  if (deleteError) {
    throw new Error(`Falha ao atualizar vínculos: ${deleteError.message}`);
  }
  if (needIds.length === 0) return;
  const { error } = await supabase.from("need_decisions").insert(
    needIds.map((needId) => ({
      household_id: householdId,
      need_id: needId,
      decision_id: decisionId,
    })),
  );
  if (error) {
    throw new Error(`Falha ao vincular necessidades: ${error.message}`);
  }
}

/** Decisões vinculadas a uma necessidade (detalhe da necessidade). */
export async function listDecisionsForNeed(
  supabase: SupabaseClient,
  needId: string,
): Promise<DecisionRow[]> {
  const { data, error } = await supabase
    .from("need_decisions")
    .select(`decision:decisions(${DECISION_COLUMNS})`)
    .eq("need_id", needId);
  if (error) {
    throw new Error(`Falha ao carregar decisões vinculadas: ${error.message}`);
  }
  const rows = (data ?? []) as unknown as Array<{
    decision: DecisionRow | null;
  }>;
  return rows
    .map((row) => row.decision)
    .filter((decision): decision is DecisionRow => decision !== null)
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
}
