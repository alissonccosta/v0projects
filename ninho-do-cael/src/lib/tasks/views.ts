import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { RESPONSIBLE_LABELS } from "@/lib/labels";
import {
  RESPONSIBLE_PARTIES,
  TASK_STATUSES,
  type ResponsibleParty,
  type TaskStatus,
  type TaskType,
  type Category,
} from "@/types/domain";

/**
 * Visões de tarefas (SDD, seção 20): semana, calendário, lista, status,
 * responsável, bloqueadas e antes do parto. Funções puras — recebem `today`
 * (AAAA-MM-DD) para serem testáveis e não dependerem de relógio.
 */

export const TASK_VIEWS = [
  "semana",
  "calendario",
  "lista",
  "status",
  "responsavel",
  "bloqueadas",
  "antes_do_parto",
] as const;
export type TaskViewKey = (typeof TASK_VIEWS)[number];

export const TASK_VIEW_LABELS: Record<TaskViewKey, string> = {
  semana: "Semana",
  calendario: "Calendário",
  lista: "Lista",
  status: "Por status",
  responsavel: "Por responsável",
  bloqueadas: "Bloqueadas",
  antes_do_parto: "Antes do parto",
};

export function parseTaskView(value: string | undefined): TaskViewKey {
  return (TASK_VIEWS as readonly string[]).includes(value ?? "")
    ? (value as TaskViewKey)
    : "semana";
}

/** Valida `mes=AAAA-MM`; fora do padrão, cai no mês de `today`. */
export function parseCalendarMonth(
  value: string | undefined,
  today: string,
): string {
  if (value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    return value;
  }
  return today.slice(0, 7);
}

export type TaskItem = {
  id: string;
  title: string;
  type: TaskType;
  category: Category | null;
  status: TaskStatus;
  responsible: ResponsibleParty;
  dueDate: string | null;
  windowStart: string | null;
  windowEnd: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  dependsOnTaskId: string | null;
  blockedReason: string | null;
  completionCriteria: string | null;
  completedAt: string | null;
  needs: Array<{ id: string; title: string }>;
  createdAt: string;
};

/** Informações da dependência, resolvidas em memória (sem self-join). */
export type TaskDependency = {
  id: string;
  title: string;
  status: TaskStatus;
  responsible: ResponsibleParty;
} | null;

const ACTIVE_STATUSES: ReadonlySet<TaskStatus> = new Set([
  "planejada",
  "em_andamento",
  "bloqueada",
]);

export function isTaskActive(status: TaskStatus): boolean {
  return ACTIVE_STATUSES.has(status);
}

/** Vencida: prazo anterior a hoje e ainda ativa (mesmo espírito da 10.6). */
export function isTaskOverdue(
  task: Pick<TaskItem, "dueDate" | "status">,
  today: string,
): boolean {
  if (!task.dueDate) return false;
  return task.dueDate < today && isTaskActive(task.status);
}

/** Prazo crescente (sem prazo por último); empate pela criação. */
export function compareTasks(a: TaskItem, b: TaskItem): number {
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  if (a.dueDate && !b.dueDate) return -1;
  if (!a.dueDate && b.dueDate) return 1;
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Semana
// ---------------------------------------------------------------------------

/** Segunda a domingo da semana de `today`. */
export function weekRange(today: string): { start: string; end: string } {
  const start = startOfWeek(parseISO(today), { weekStartsOn: 1 });
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(addDays(start, 6), "yyyy-MM-dd"),
  };
}

export type WeekView = {
  range: { start: string; end: string };
  /** Ativas com prazo anterior a hoje. */
  overdue: TaskItem[];
  /** Um bloco por dia (segunda→domingo) com as tarefas do dia. */
  days: Array<{ date: string; tasks: TaskItem[] }>;
  /** Ativas sem prazo — não somem da semana, ficam num bloco próprio. */
  undated: TaskItem[];
};

export function buildWeekView(tasks: TaskItem[], today: string): WeekView {
  const range = weekRange(today);
  const overdue = tasks
    .filter((task) => isTaskOverdue(task, today))
    .sort(compareTasks);
  const days: WeekView["days"] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = format(addDays(parseISO(range.start), offset), "yyyy-MM-dd");
    const dayTasks = tasks
      .filter((task) => task.dueDate === date)
      .sort(compareTasks);
    days.push({ date, tasks: dayTasks });
  }
  const undated = tasks
    .filter((task) => !task.dueDate && isTaskActive(task.status))
    .sort(compareTasks);
  return { range, overdue, days, undated };
}

// ---------------------------------------------------------------------------
// Calendário
// ---------------------------------------------------------------------------

export type CalendarMonth = {
  /** AAAA-MM exibido. */
  month: string;
  previous: string;
  next: string;
  /** Semanas completas (segunda→domingo) cobrindo o mês. */
  weeks: Array<Array<{ date: string; inMonth: boolean }>>;
};

export function buildCalendarMonth(month: string): CalendarMonth {
  const first = startOfMonth(parseISO(`${month}-01`));
  const gridStart = startOfWeek(first, { weekStartsOn: 1 });
  const weeks: CalendarMonth["weeks"] = [];
  let cursor = gridStart;
  // Cobre o mês inteiro: para quando a semana começa depois do fim do mês.
  const monthEnd = addMonths(first, 1);
  while (cursor < monthEnd) {
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(cursor, index);
      return {
        date: format(date, "yyyy-MM-dd"),
        inMonth: format(date, "yyyy-MM") === month,
      };
    });
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }
  return {
    month,
    previous: format(addMonths(first, -1), "yyyy-MM"),
    next: format(addMonths(first, 1), "yyyy-MM"),
    weeks,
  };
}

export function tasksByDate(tasks: TaskItem[]): Map<string, TaskItem[]> {
  const map = new Map<string, TaskItem[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const list = map.get(task.dueDate) ?? [];
    list.push(task);
    map.set(task.dueDate, list);
  }
  for (const list of map.values()) {
    list.sort(compareTasks);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Agrupamentos
// ---------------------------------------------------------------------------

export function groupTasksByStatus(
  tasks: TaskItem[],
): Array<{ status: TaskStatus; tasks: TaskItem[] }> {
  return TASK_STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status).sort(compareTasks),
  })).filter((group) => group.tasks.length > 0);
}

export function groupTasksByResponsible(
  tasks: TaskItem[],
): Array<{ responsible: ResponsibleParty; tasks: TaskItem[] }> {
  return RESPONSIBLE_PARTIES.map((responsible) => ({
    responsible,
    tasks: tasks
      .filter((task) => task.responsible === responsible)
      .sort(compareTasks),
  })).filter((group) => group.tasks.length > 0);
}

// ---------------------------------------------------------------------------
// Bloqueadas (seção 20: dependência, bloqueador, ação e responsável)
// ---------------------------------------------------------------------------

export type BlockedInfo = {
  /** Título da tarefa da qual esta depende (ou null). */
  dependencyTitle: string | null;
  /** A dependência já foi concluída — dá para desbloquear. */
  dependencyDone: boolean;
  /** O que bloqueia, nas palavras de quem registrou. */
  blocker: string | null;
  /** Próxima ação concreta para destravar. */
  action: string;
  /** Quem destrava: responsável da dependência ou da própria tarefa. */
  actionResponsible: ResponsibleParty;
};

export function blockedInfo(
  task: Pick<TaskItem, "blockedReason" | "responsible">,
  dependency: TaskDependency,
): BlockedInfo {
  const dependencyDone = dependency?.status === "concluida";
  let action: string;
  if (dependency && !dependencyDone) {
    action = `Concluir “${dependency.title}”`;
  } else if (dependency && dependencyDone) {
    action = "Dependência concluída — retome a tarefa";
  } else if (task.blockedReason) {
    action = `Resolver: ${task.blockedReason}`;
  } else {
    action = "Registre a dependência ou o motivo do bloqueio";
  }
  return {
    dependencyTitle: dependency?.title ?? null,
    dependencyDone,
    blocker: task.blockedReason,
    action,
    actionResponsible: dependency?.responsible ?? task.responsible,
  };
}

// ---------------------------------------------------------------------------
// Antes do parto
// ---------------------------------------------------------------------------

export type BeforeBirthView = {
  tasks: TaskItem[];
  /** Dias entre hoje e a data prevista (negativo se já passou). */
  daysUntilBirth: number;
};

/** Ativas com prazo até a data prevista do parto (inclusive). */
export function buildBeforeBirthView(
  tasks: TaskItem[],
  birthDate: string,
  today: string,
): BeforeBirthView {
  const selected = tasks
    .filter(
      (task) =>
        isTaskActive(task.status) &&
        task.dueDate !== null &&
        task.dueDate <= birthDate,
    )
    .sort(compareTasks);
  return {
    tasks: selected,
    daysUntilBirth: differenceInCalendarDays(
      parseISO(birthDate),
      parseISO(today),
    ),
  };
}

/** Rótulo do responsável que age (usado nos cards de bloqueio). */
export function responsibleLabel(value: ResponsibleParty): string {
  return RESPONSIBLE_LABELS[value];
}
