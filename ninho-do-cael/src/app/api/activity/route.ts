import type { NextRequest } from "next/server";

import { apiOk } from "@/lib/api/result";
import { requireMemberApi } from "@/lib/api/require-member";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listRecentActivity } from "@/server/repositories/activity-repository";

/** GET /api/activity — feed recente (seção 26): quem, o quê, origem, quando. */
export async function GET(request: NextRequest) {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  const rawLimit = Number(request.nextUrl.searchParams.get("limite") ?? "50");
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), 200)
    : 50;

  const supabase = await createSupabaseServerClient();
  const activity = await listRecentActivity(supabase, limit);
  return apiOk(activity, { meta: { limite: limit } });
}
