import type { SupabaseClient } from "@supabase/supabase-js";

/** Histórico de qualquer entidade (SDD, seção 26). */

export type ActivityRow = {
  id: string;
  action: string;
  changes: Record<string, unknown> | null;
  origin: string;
  created_at: string;
  actor: { display_name: string } | null;
};

export async function listEntityActivity(
  supabase: SupabaseClient,
  entityType: string,
  entityId: string,
): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      "id, action, changes, origin, created_at, actor:profiles(display_name)",
    )
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    throw new Error(`Falha ao carregar o histórico: ${error.message}`);
  }
  return (data ?? []) as unknown as ActivityRow[];
}
