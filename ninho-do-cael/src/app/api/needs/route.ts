import type { NextRequest } from "next/server";

import { apiError, apiOk } from "@/lib/api/result";
import { getSessionInfo } from "@/lib/auth/session";
import {
  compareNeeds,
  needMatchesFilters,
  parseNeedFilters,
} from "@/lib/needs/filters";
import {
  buildNeedViewModel,
  viewModelToFilterable,
} from "@/lib/needs/view-model";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createNeedSchema } from "@/lib/validation/needs";
import { listNeeds } from "@/server/repositories/needs-repository";
import { createNeed } from "@/server/services/needs-service";

async function requireMember() {
  const session = await getSessionInfo();
  if (session.mode === "demo") {
    return {
      error: apiError(
        "nao_configurado",
        "Supabase não configurado neste ambiente (veja docs/setup-supabase.md).",
        { status: 503 },
      ),
    } as const;
  }
  if (session.mode !== "member") {
    return {
      error: apiError("nao_autenticado", "É preciso estar autenticado.", {
        status: 401,
      }),
    } as const;
  }
  return { session } as const;
}

/** GET /api/needs — lista com os filtros da seção 16 na query string. */
export async function GET(request: NextRequest) {
  const auth = await requireMember();
  if ("error" in auth) return auth.error;

  const supabase = await createSupabaseServerClient();
  const rows = await listNeeds(supabase);
  const today = new Date().toISOString().slice(0, 10);
  const filters = parseNeedFilters(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  const needs = rows
    .map((row) => buildNeedViewModel(row, today))
    .filter((need) => needMatchesFilters(viewModelToFilterable(need), filters));
  needs.sort((a, b) =>
    compareNeeds(viewModelToFilterable(a), viewModelToFilterable(b)),
  );

  return apiOk(needs, {
    meta: { total: rows.length, filtrados: needs.length },
  });
}

/** POST /api/needs — cria uma necessidade (campos da seção 16). */
export async function POST(request: NextRequest) {
  const auth = await requireMember();
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("json_invalido", "Corpo da requisição não é JSON válido.", {
      status: 400,
    });
  }

  const parsed = createNeedSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  const row = await createNeed(
    supabase,
    {
      profileId: auth.session.userId,
      householdId: auth.session.householdId,
    },
    parsed.data,
  );

  return apiOk(row, { status: 201 });
}
