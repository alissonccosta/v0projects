import { requireMemberApi } from "@/lib/api/require-member";
import { apiError, apiOk } from "@/lib/api/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** GET /api/inventory — estoque com a necessidade vinculada. */
export async function GET() {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      "id, name, quantity, condition, readiness_status, location, origin, expires_at, batch, notes, need_id, needs(title, category), archived_at",
    )
    .order("created_at", { ascending: false });
  if (error) {
    return apiError("consulta", "Falha ao listar o estoque.", { status: 500 });
  }
  return apiOk(data ?? []);
}
