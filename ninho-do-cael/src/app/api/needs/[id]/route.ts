import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiOk } from "@/lib/api/result";
import { getSessionInfo } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateNeedSchema } from "@/lib/validation/needs";
import {
  getNeedById,
  listNeedActivity,
} from "@/server/repositories/needs-repository";
import { NeedNotFoundError, updateNeed } from "@/server/services/needs-service";

type RouteContext = { params: Promise<{ id: string }> };

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

async function parseId(context: RouteContext) {
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) {
    return {
      error: apiError("id_invalido", "Identificador inválido.", {
        status: 400,
      }),
    } as const;
  }
  return { id } as const;
}

/** GET /api/needs/:id — detalhe + histórico. */
export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireMember();
  if ("error" in auth) return auth.error;
  const param = await parseId(context);
  if ("error" in param) return param.error;

  const supabase = await createSupabaseServerClient();
  const need = await getNeedById(supabase, param.id);
  if (!need) {
    return apiError("nao_encontrada", "Necessidade não encontrada.", {
      status: 404,
    });
  }
  const activity = await listNeedActivity(supabase, param.id);
  return apiOk({ need, activity });
}

/** PATCH /api/needs/:id — edição parcial; `arquivada` arquiva/restaura. */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireMember();
  if ("error" in auth) return auth.error;
  const param = await parseId(context);
  if ("error" in param) return param.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("json_invalido", "Corpo da requisição não é JSON válido.", {
      status: 400,
    });
  }

  const parsed = updateNeedSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  try {
    const row = await updateNeed(
      supabase,
      {
        profileId: auth.session.userId,
        householdId: auth.session.householdId,
      },
      param.id,
      parsed.data,
    );
    return apiOk(row);
  } catch (error) {
    if (error instanceof NeedNotFoundError) {
      return apiError("nao_encontrada", "Necessidade não encontrada.", {
        status: 404,
      });
    }
    throw error;
  }
}

/** DELETE /api/needs/:id — exclusão lógica (seção 10.10). */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireMember();
  if ("error" in auth) return auth.error;
  const param = await parseId(context);
  if ("error" in param) return param.error;

  const supabase = await createSupabaseServerClient();
  try {
    const row = await updateNeed(
      supabase,
      {
        profileId: auth.session.userId,
        householdId: auth.session.householdId,
      },
      param.id,
      { arquivada: true },
    );
    return apiOk({ id: row.id, arquivada: true });
  } catch (error) {
    if (error instanceof NeedNotFoundError) {
      return apiError("nao_encontrada", "Necessidade não encontrada.", {
        status: 404,
      });
    }
    throw error;
  }
}
