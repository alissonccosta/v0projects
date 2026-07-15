import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiOk } from "@/lib/api/result";
import { requireMemberApi } from "@/lib/api/require-member";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { patchDecisionSchema } from "@/lib/validation/decisions";
import {
  DecisionNotFoundError,
  DecisionRuleError,
  updateDecision,
} from "@/server/services/decisions-service";

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/decisions/:id — edição parcial ("decidida" só pelo app, com conclusão). */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) {
    return apiError("id_invalido", "Identificador inválido.", { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("json_invalido", "Corpo da requisição não é JSON válido.", {
      status: 400,
    });
  }

  const parsed = patchDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  try {
    const row = await updateDecision(
      supabase,
      {
        profileId: auth.session.userId,
        householdId: auth.session.householdId,
      },
      id,
      parsed.data,
    );
    return apiOk(row);
  } catch (error) {
    if (error instanceof DecisionNotFoundError) {
      return apiError("nao_encontrada", "Decisão não encontrada.", {
        status: 404,
      });
    }
    if (error instanceof DecisionRuleError) {
      return apiError("regra_violada", error.message, { status: 422 });
    }
    throw error;
  }
}
