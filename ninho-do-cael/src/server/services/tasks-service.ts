import type { SupabaseClient } from "@supabase/supabase-js";

import { diffChanges } from "@/lib/needs/diff";
import type {
  CompleteTaskInput,
  PatchTaskInput,
  TaskInput,
} from "@/lib/validation/tasks";
import { insertActivityLog } from "@/server/repositories/needs-repository";
import {
  getTaskById,
  insertTask,
  listTasksForNeed,
  setTaskNeeds,
  updateTaskRow,
  type TaskRow,
} from "@/server/repositories/tasks-repository";

/**
 * Regras de escrita de tarefas (SDD, seção 20): dependências consistentes,
 * bloqueio sempre explicado e conclusão apenas pelo fluxo com critério
 * confirmado. Toda mudança gera histórico (seção 26).
 */

type Actor = { profileId: string; householdId: string };

export class TaskNotFoundError extends Error {
  constructor() {
    super("Tarefa não encontrada.");
    this.name = "TaskNotFoundError";
  }
}

/** Violação de regra com mensagem própria para a interface. */
export class TaskRuleError extends Error {
  readonly field?: string;
  constructor(message: string, field?: string) {
    super(message);
    this.name = "TaskRuleError";
    this.field = field;
  }
}

/** Campos do formulário que vão direto para a linha do banco. */
function rowFields(input: TaskInput | PatchTaskInput) {
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "need_ids") continue;
    if (value !== undefined) patch[key] = value;
  }
  return patch;
}

/** Sobe a cadeia de dependências para impedir ciclos (volume pequeno). */
async function assertNoDependencyCycle(
  supabase: SupabaseClient,
  taskId: string,
  dependencyId: string,
): Promise<void> {
  if (dependencyId === taskId) {
    throw new TaskRuleError(
      "A tarefa não pode depender dela mesma.",
      "depends_on_task_id",
    );
  }
  let cursor: string | null = dependencyId;
  for (let hop = 0; cursor && hop < 25; hop += 1) {
    const current: TaskRow | null = await getTaskById(supabase, cursor);
    if (!current) {
      throw new TaskRuleError(
        "Dependência não encontrada.",
        "depends_on_task_id",
      );
    }
    if (current.depends_on_task_id === taskId) {
      throw new TaskRuleError(
        "Essas tarefas dependeriam uma da outra — ajuste a cadeia.",
        "depends_on_task_id",
      );
    }
    cursor = current.depends_on_task_id;
  }
}

export async function createTask(
  supabase: SupabaseClient,
  actor: Actor,
  input: TaskInput,
): Promise<TaskRow> {
  if (input.depends_on_task_id) {
    const dependency = await getTaskById(supabase, input.depends_on_task_id);
    if (!dependency) {
      throw new TaskRuleError(
        "Dependência não encontrada.",
        "depends_on_task_id",
      );
    }
  }
  const row = await insertTask(supabase, {
    ...rowFields(input),
    household_id: actor.householdId,
  });
  if (input.need_ids.length > 0) {
    await setTaskNeeds(supabase, actor.householdId, row.id, input.need_ids);
  }
  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "task",
    entity_id: row.id,
    action: "criacao",
    changes: { title: input.title },
  });
  return row;
}

export async function updateTask(
  supabase: SupabaseClient,
  actor: Actor,
  id: string,
  input: PatchTaskInput,
): Promise<TaskRow> {
  const before = await getTaskById(supabase, id);
  if (!before) {
    throw new TaskNotFoundError();
  }

  const patch = rowFields(input);

  // Estado resultante precisa continuar válido (também para PATCH parcial).
  const nextStatus = (patch.status as string | undefined) ?? before.status;
  const nextDependsOn =
    "depends_on_task_id" in patch
      ? (patch.depends_on_task_id as string | null | undefined)
      : before.depends_on_task_id;
  const nextReason =
    "blocked_reason" in patch
      ? (patch.blocked_reason as string | null | undefined)
      : before.blocked_reason;
  if (nextStatus === "bloqueada" && !nextDependsOn && !nextReason) {
    throw new TaskRuleError(
      "Diga o que bloqueia ou aponte a tarefa da qual depende.",
      "blocked_reason",
    );
  }
  if (nextDependsOn && nextDependsOn !== before.depends_on_task_id) {
    await assertNoDependencyCycle(supabase, id, nextDependsOn);
  }

  // Reabrir uma concluída volta para o fluxo normal e limpa a data.
  if (before.status === "concluida" && nextStatus !== "concluida") {
    patch.completed_at = null;
  }

  const changes = diffChanges(
    before as unknown as Record<string, unknown>,
    patch,
  );

  const needIdsBefore = (before.need_tasks ?? [])
    .map((link) => link.need.id)
    .sort();
  const needIdsAfter = input.need_ids ? [...input.need_ids].sort() : null;
  const needsChanged =
    needIdsAfter !== null &&
    JSON.stringify(needIdsBefore) !== JSON.stringify(needIdsAfter);

  if (Object.keys(changes).length === 0 && !needsChanged) {
    return before;
  }

  const row =
    Object.keys(changes).length > 0
      ? await updateTaskRow(supabase, id, patch)
      : before;
  if (needsChanged && needIdsAfter) {
    await setTaskNeeds(supabase, actor.householdId, id, needIdsAfter);
  }

  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "task",
    entity_id: id,
    action: "atualizacao",
    changes: needsChanged
      ? { ...changes, necessidades: { de: needIdsBefore, para: needIdsAfter } }
      : changes,
  });
  return row;
}

/**
 * Conclusão (seção 20): o critério foi confirmado no formulário; aqui
 * registramos data, nota, custo real e referência.
 */
export async function completeTask(
  supabase: SupabaseClient,
  actor: Actor,
  id: string,
  input: CompleteTaskInput,
): Promise<TaskRow> {
  const before = await getTaskById(supabase, id);
  if (!before) {
    throw new TaskNotFoundError();
  }
  if (before.status === "concluida") {
    throw new TaskRuleError("Esta tarefa já foi concluída.");
  }

  const patch: Record<string, unknown> = {
    status: "concluida",
    completed_at: new Date().toISOString(),
  };
  if (input.completion_notes !== undefined) {
    patch.completion_notes = input.completion_notes;
  }
  if (input.actual_cost !== undefined) {
    patch.actual_cost = input.actual_cost;
  }
  if (input.completion_reference !== undefined) {
    patch.completion_reference = input.completion_reference;
  }

  const row = await updateTaskRow(supabase, id, patch);
  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "task",
    entity_id: id,
    action: "conclusao",
    changes: diffChanges(before as unknown as Record<string, unknown>, patch),
  });
  return row;
}

/** Ações rápidas de status (iniciar, retomar, cancelar) com histórico. */
export async function patchTaskStatus(
  supabase: SupabaseClient,
  actor: Actor,
  id: string,
  status: "planejada" | "em_andamento" | "cancelada",
): Promise<TaskRow> {
  return updateTask(supabase, actor, id, { status });
}

export { listTasksForNeed };
