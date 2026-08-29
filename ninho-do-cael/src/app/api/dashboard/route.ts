import { apiOk } from "@/lib/api/result";
import { requireMemberApi } from "@/lib/api/require-member";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadDashboardData } from "@/server/services/dashboard-service";

/** GET /api/dashboard — agregados da seção 15, calculados no servidor. */
export async function GET() {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const data = await loadDashboardData(supabase, today);
  return apiOk(data, { meta: { referencia: today } });
}
