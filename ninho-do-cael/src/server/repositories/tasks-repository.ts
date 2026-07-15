import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Acesso a dados de tarefas (seção 20). Sem self-join no banco: dependências
 * são resolvidas em memória pela camada de visão (volume pequeno, D-027).
 */

export type TaskRow = {
  id: string;
  household_id: string;
  title: string;
  type: string;
  category: string | null;
  status: string;
  responsible: string;
  due_date: string | null;
  window_start: string | null;
  window_end: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  depends_on_task_id: string | null;
  blocked_reason: string | null;
  completion_criteria: string | null;
  completion_notes: string | null;
  completion_reference: string | null;
  completed_at: string | null;
  original_content: string | null;
  sync_status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  need_tasks?: Array<{ need: { id: string; title: string; phase: string } }>;
};

const TASK_COLUMNS =
  "id, household_id, title, type, category, status, responsible, due_date, " +
  "window_start, window_end, estimated_cost, actual_cost, depends_on_task_id, " +
  "blocked_reason, completion_criteria, completion_notes, completion_reference, " +
  "completed_at, original_content, sync_status, archived_at, created_at, updated_at";

const TASK_WITH_NEEDS = `${TASK_COLUMNS}, need_tasks(need:needs(id, title, phase))`;

export async function listTasks(supabase: SupabaseClient): Promise<TaskRow[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_WITH_NEEDS)
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(`Falha ao listar tarefas: ${error.message}`);
  }
  return (data ?? []) as unknown as TaskRow[];
}

export async function getTaskById(
  supabase: SupabaseClient,
  id: string,
): Promise<TaskRow | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_WITH_NEEDS)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(`Falha ao carregar a tarefa: ${error.message}`);
  }
  return (data as unknown as TaskRow) ?? null;
}

/** Tarefas que dependem desta (para mostrar o que ela destrava). */
export async function listDependentTasks(
  supabase: SupabaseClient,
  taskId: string,
): Promise<TaskRow[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("depends_on_task_id", taskId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(`Falha ao carregar tarefas dependentes: ${error.message}`);
  }
  return (data ?? []) as unknown as TaskRow[];
}

export async function insertTask(
  supabase: SupabaseClient,
  values: Record<string, unknown>,
): Promise<TaskRow> {
  const { data, error } = await supabase
    .from("tasks")
    .insert(values)
    .select(TASK_COLUMNS)
    .single();
  if (error) {
    throw new Error(`Falha ao criar a tarefa: ${error.message}`);
  }
  return data as unknown as TaskRow;
}

export async function updateTaskRow(
  supabase: SupabaseClient,
  id: string,
  patch: Record<string, unknown>,
): Promise<TaskRow> {
  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .select(TASK_COLUMNS)
    .single();
  if (error) {
    throw new Error(`Falha ao atualizar a tarefa: ${error.message}`);
  }
  return data as unknown as TaskRow;
}

/** Substitui os vínculos tarefa↔necessidade pelo conjunto informado. */
export async function setTaskNeeds(
  supabase: SupabaseClient,
  householdId: string,
  taskId: string,
  needIds: string[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("need_tasks")
    .delete()
    .eq("task_id", taskId);
  if (deleteError) {
    throw new Error(`Falha ao atualizar vínculos: ${deleteError.message}`);
  }
  if (needIds.length === 0) return;
  const { error } = await supabase.from("need_tasks").insert(
    needIds.map((needId) => ({
      household_id: householdId,
      need_id: needId,
      task_id: taskId,
    })),
  );
  if (error) {
    throw new Error(`Falha ao vincular necessidades: ${error.message}`);
  }
}

/** Tarefas vinculadas a uma necessidade (detalhe da necessidade). */
export async function listTasksForNeed(
  supabase: SupabaseClient,
  needId: string,
): Promise<TaskRow[]> {
  const { data, error } = await supabase
    .from("need_tasks")
    .select(`task:tasks(${TASK_COLUMNS})`)
    .eq("need_id", needId);
  if (error) {
    throw new Error(`Falha ao carregar tarefas vinculadas: ${error.message}`);
  }
  const rows = (data ?? []) as unknown as Array<{ task: TaskRow | null }>;
  return rows
    .map((row) => row.task)
    .filter((task): task is TaskRow => task !== null)
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
}
