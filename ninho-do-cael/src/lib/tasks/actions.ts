"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { ActionState } from "@/lib/auth/action-state";
import { getSessionInfo } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { completeTaskSchema, taskSchema } from "@/lib/validation/tasks";
import {
  TaskNotFoundError,
  TaskRuleError,
  completeTask,
  createTask,
  patchTaskStatus,
  updateTask,
} from "@/server/services/tasks-service";

/** Ações de tarefas (SDD, seção 20): persistem, registram histórico e
 *  revalidam as telas que dependem delas (tarefas, jornada, necessidades). */

type MemberContext = {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  actor: { profileId: string; householdId: string };
};

async function requireMemberContext(): Promise<
  { ok: true; context: MemberContext } | { ok: false; state: ActionState }
> {
  const session = await getSessionInfo();
  if (session.mode !== "member") {
    return {
      ok: false,
      state: {
        status: "error",
        message:
          session.mode === "demo"
            ? "Supabase não configurado — ações ficam disponíveis após o setup."
            : "Sessão expirada. Entre novamente.",
      },
    };
  }
  const supabase = await createSupabaseServerClient();
  return {
    ok: true,
    context: {
      supabase,
      actor: { profileId: session.userId, householdId: session.householdId },
    },
  };
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "(raiz)";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

function ruleErrorState(error: TaskRuleError): ActionState {
  return {
    status: "error",
    message: error.field ? "Confira os campos destacados." : error.message,
    fieldErrors: error.field ? { [error.field]: error.message } : undefined,
  };
}

const TASK_FORM_KEYS = [
  "title",
  "type",
  "category",
  "status",
  "responsible",
  "due_date",
  "window_start",
  "window_end",
  "estimated_cost",
  "depends_on_task_id",
  "blocked_reason",
  "completion_criteria",
];

function taskFormToObject(formData: FormData): Record<string, unknown> {
  const object: Record<string, unknown> = {};
  for (const key of TASK_FORM_KEYS) {
    object[key] = formData.get(key) ?? undefined;
  }
  object.need_ids = formData
    .getAll("need_ids")
    .map(String)
    .filter((value) => value.length > 0);
  return object;
}

function revalidateTasks(id?: string, needIds: string[] = []) {
  revalidatePath("/app/tarefas");
  revalidatePath("/app/jornada");
  if (id) revalidatePath(`/app/tarefas/${id}`);
  for (const needId of needIds) {
    revalidatePath(`/app/necessidades/${needId}`);
  }
}

export async function criarTarefa(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = taskSchema.safeParse(taskFormToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  let row;
  try {
    row = await createTask(
      member.context.supabase,
      member.context.actor,
      parsed.data,
    );
  } catch (error) {
    if (error instanceof TaskRuleError) return ruleErrorState(error);
    throw error;
  }
  revalidateTasks(row.id, parsed.data.need_ids);
  redirect(`/app/tarefas/${row.id}`);
}

export async function editarTarefa(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = taskSchema.safeParse(taskFormToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await updateTask(
      member.context.supabase,
      member.context.actor,
      id,
      parsed.data,
    );
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return { status: "error", message: "Tarefa não encontrada." };
    }
    if (error instanceof TaskRuleError) return ruleErrorState(error);
    throw error;
  }
  revalidateTasks(id, parsed.data.need_ids);
  redirect(`/app/tarefas/${id}`);
}

/** Conclusão com critério confirmado (seção 20). */
export async function concluirTarefa(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = completeTaskSchema.safeParse({
    criteria_confirmed: formData.get("criteria_confirmed") === "on",
    completion_notes: formData.get("completion_notes") ?? undefined,
    actual_cost: formData.get("actual_cost") ?? undefined,
    completion_reference: formData.get("completion_reference") ?? undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await completeTask(
      member.context.supabase,
      member.context.actor,
      id,
      parsed.data,
    );
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return { status: "error", message: "Tarefa não encontrada." };
    }
    if (error instanceof TaskRuleError) return ruleErrorState(error);
    throw error;
  }
  revalidateTasks(id);
  return { status: "success", message: "Tarefa concluída. Bom trabalho!" };
}

async function quickStatus(
  id: string,
  status: "planejada" | "em_andamento" | "cancelada",
  successMessage: string,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;
  try {
    await patchTaskStatus(
      member.context.supabase,
      member.context.actor,
      id,
      status,
    );
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return { status: "error", message: "Tarefa não encontrada." };
    }
    if (error instanceof TaskRuleError) return ruleErrorState(error);
    return {
      status: "error",
      message: "Não foi possível salvar agora. Tente novamente.",
    };
  }
  revalidateTasks(id);
  return { status: "success", message: successMessage };
}

export async function iniciarTarefa(id: string): Promise<ActionState> {
  return quickStatus(id, "em_andamento", "Tarefa iniciada.");
}

/** Desbloqueia/reabre: volta para "em andamento" e limpa a conclusão. */
export async function retomarTarefa(id: string): Promise<ActionState> {
  return quickStatus(id, "em_andamento", "Tarefa retomada.");
}

export async function cancelarTarefa(id: string): Promise<ActionState> {
  return quickStatus(id, "cancelada", "Tarefa cancelada.");
}
