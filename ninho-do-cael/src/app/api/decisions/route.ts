import type { NextRequest } from "next/server";

import { apiError, apiOk } from "@/lib/api/result";
import { requireMemberApi } from "@/lib/api/require-member";
import { decisionGroupKey } from "@/lib/decisions/model";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decisionSchema } from "@/lib/validation/decisions";
import { listDecisions } from "@/server/repositories/decisions-repository";
import { createDecision } from "@/server/services/decisions-service";
import type { DecisionStatus } from "@/types/domain";

/** GET /api/decisions — lista; filtros opcionais status, tipo e grupo (seção 21). */
export async function GET(request: NextRequest) {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  const supabase = await createSupabaseServerClient();
  const rows = await listDecisions(supabase);

  const status = request.nextUrl.searchParams.get("status");
  const type = request.nextUrl.searchParams.get("tipo");
  const group = request.nextUrl.searchParams.get("grupo");
  const filtered = rows.filter(
    (row) =>
      (!status || row.status === status) &&
      (!type || row.type === type) &&
      (!group || decisionGroupKey(row.status as DecisionStatus) === group),
  );

  return apiOk(filtered, {
    meta: { total: rows.length, filtrados: filtered.length },
  });
}

/** POST /api/decisions — cria decisão (campos da seção 21 + need_ids). */
export async function POST(request: NextRequest) {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("json_invalido", "Corpo da requisição não é JSON válido.", {
      status: 400,
    });
  }

  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  const row = await createDecision(
    supabase,
    {
      profileId: auth.session.userId,
      householdId: auth.session.householdId,
    },
    parsed.data,
  );
  return apiOk(row, { status: 201 });
}
