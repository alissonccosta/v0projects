import type { TaskItem, TaskDependency } from "@/lib/tasks/views";
import type { TaskRow } from "@/server/repositories/tasks-repository";
import type {
  Category,
  ResponsibleParty,
  TaskStatus,
  TaskType,
} from "@/types/domain";

/** Linha do banco → item das visões (seção 20). */
export function buildTaskItem(row: TaskRow): TaskItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type as TaskType,
    category: (row.category as Category | null) ?? null,
    status: row.status as TaskStatus,
    responsible: row.responsible as ResponsibleParty,
    dueDate: row.due_date,
    windowStart: row.window_start,
    windowEnd: row.window_end,
    estimatedCost:
      row.estimated_cost === null ? null : Number(row.estimated_cost),
    actualCost: row.actual_cost === null ? null : Number(row.actual_cost),
    dependsOnTaskId: row.depends_on_task_id,
    blockedReason: row.blocked_reason,
    completionCriteria: row.completion_criteria,
    completedAt: row.completed_at,
    needs: (row.need_tasks ?? []).map((link) => ({
      id: link.need.id,
      title: link.need.title,
    })),
    createdAt: row.created_at,
  };
}

/** Resolve a dependência em memória a partir da lista completa. */
export function dependencyFor(
  task: TaskItem,
  byId: Map<string, TaskItem>,
): TaskDependency {
  if (!task.dependsOnTaskId) return null;
  const dependency = byId.get(task.dependsOnTaskId);
  if (!dependency) return null;
  return {
    id: dependency.id,
    title: dependency.title,
    status: dependency.status,
    responsible: dependency.responsible,
  };
}
