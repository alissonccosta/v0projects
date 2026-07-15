import type { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiOk } from "@/lib/api/result";
import { requireMemberApi } from "@/lib/api/require-member";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { patchTaskSchema } from "@/lib/validation/tasks";
import {
  TaskNotFoundError,
  TaskRuleError,
  updateTask,
} from "@/server/services/tasks-service";

type RouteContext = { params: Promise<{ id: string }> };

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

/** PATCH /api/tasks/:id — edição parcial (conclusão tem rota própria). */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireMemberApi();
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

  const parsed = patchTaskSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  try {
    const row = await updateTask(
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
    if (error instanceof TaskNotFoundError) {
      return apiError("nao_encontrada", "Tarefa não encontrada.", {
        status: 404,
      });
    }
    if (error instanceof TaskRuleError) {
      return apiError("regra_violada", error.message, { status: 422 });
    }
    throw error;
  }
}
