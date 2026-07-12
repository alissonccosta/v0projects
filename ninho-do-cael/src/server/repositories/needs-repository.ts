import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Acesso a dados de necessidades. Camada fina sobre o Supabase — regras de
 * negócio ficam nos serviços e em lib/ (SDD, seção 30). A RLS garante o
 * isolamento por household; o insert preenche household_id explicitamente.
 */

export type NeedRow = {
  id: string;
  household_id: string;
  title: string;
  type: string;
  audience: string;
  category: string;
  priority: string;
  criticality: string;
  phase: string;
  decision_status: string;
  acquisition_status: string;
  logistics_status: string;
  readiness_status: string;
  responsible: string;
  required_quantity: number | null;
  available_quantity: number | null;
  unit: string | null;
  estimated_price: number | null;
  paid_price: number | null;
  due_date: string | null;
  original_content: string | null;
  audit_notes: string | null;
  original_notion_url: string | null;
  sync_status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

const NEED_COLUMNS =
  "id, household_id, title, type, audience, category, priority, criticality, phase, " +
  "decision_status, acquisition_status, logistics_status, readiness_status, responsible, " +
  "required_quantity, available_quantity, unit, estimated_price, paid_price, due_date, " +
  "original_content, audit_notes, original_notion_url, sync_status, archived_at, " +
  "created_at, updated_at";

export async function listNeeds(supabase: SupabaseClient): Promise<NeedRow[]> {
  const { data, error } = await supabase
    .from("needs")
    .select(NEED_COLUMNS)
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(`Falha ao listar necessidades: ${error.message}`);
  }
  return (data ?? []) as unknown as NeedRow[];
}

export async function getNeedById(
  supabase: SupabaseClient,
  id: string,
): Promise<NeedRow | null> {
  const { data, error } = await supabase
    .from("needs")
    .select(NEED_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(`Falha ao carregar a necessidade: ${error.message}`);
  }
  return (data as unknown as NeedRow) ?? null;
}

export async function insertNeed(
  supabase: SupabaseClient,
  values: Record<string, unknown>,
): Promise<NeedRow> {
  const { data, error } = await supabase
    .from("needs")
    .insert(values)
    .select(NEED_COLUMNS)
    .single();
  if (error) {
    throw new Error(`Falha ao criar a necessidade: ${error.message}`);
  }
  return data as unknown as NeedRow;
}

export async function updateNeedRow(
  supabase: SupabaseClient,
  id: string,
  patch: Record<string, unknown>,
): Promise<NeedRow> {
  const { data, error } = await supabase
    .from("needs")
    .update(patch)
    .eq("id", id)
    .select(NEED_COLUMNS)
    .single();
  if (error) {
    throw new Error(`Falha ao atualizar a necessidade: ${error.message}`);
  }
  return data as unknown as NeedRow;
}

export type ActivityRow = {
  id: string;
  action: string;
  changes: Record<string, unknown> | null;
  origin: string;
  created_at: string;
  actor: { display_name: string } | null;
};

export async function listNeedActivity(
  supabase: SupabaseClient,
  needId: string,
): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      "id, action, changes, origin, created_at, actor:profiles(display_name)",
    )
    .eq("entity_type", "need")
    .eq("entity_id", needId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    throw new Error(`Falha ao carregar o histórico: ${error.message}`);
  }
  return (data ?? []) as unknown as ActivityRow[];
}

export async function insertActivityLog(
  supabase: SupabaseClient,
  entry: {
    household_id: string;
    actor_profile_id: string | null;
    entity_type: string;
    entity_id: string;
    action: string;
    changes: Record<string, unknown> | null;
  },
): Promise<void> {
  const { error } = await supabase.from("activity_logs").insert({
    ...entry,
    origin: "app",
  });
  if (error) {
    // Log de atividade nunca deve derrubar a operação principal, mas a falha
    // não pode ser silenciosa (SDD, seção 26).
    console.error(`Falha ao registrar atividade: ${error.message}`);
  }
}
