import type { NextRequest } from "next/server";

import { apiError, apiOk } from "@/lib/api/result";
import { requireMemberApi } from "@/lib/api/require-member";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { taskSchema } from "@/lib/validation/tasks";
import { listTasks } from "@/server/repositories/tasks-repository";
import { TaskRuleError, createTask } from "@/server/services/tasks-service";

/** GET /api/tasks — lista; filtros opcionais status e responsavel. */
export async function GET(request: NextRequest) {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  const supabase = await createSupabaseServerClient();
  const rows = await listTasks(supabase);

  const status = request.nextUrl.searchParams.get("status");
  const responsible = request.nextUrl.searchParams.get("responsavel");
  const filtered = rows.filter(
    (row) =>
      (!status || row.status === status) &&
      (!responsible || row.responsible === responsible),
  );

  return apiOk(filtered, {
    meta: { total: rows.length, filtrados: filtered.length },
  });
}

/** POST /api/tasks — cria tarefa (campos da seção 20 + need_ids). */
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

  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  try {
    const row = await createTask(
      supabase,
      {
        profileId: auth.session.userId,
        householdId: auth.session.householdId,
      },
      parsed.data,
    );
    return apiOk(row, { status: 201 });
  } catch (error) {
    if (error instanceof TaskRuleError) {
      return apiError("regra_violada", error.message, { status: 422 });
    }
    throw error;
  }
}
