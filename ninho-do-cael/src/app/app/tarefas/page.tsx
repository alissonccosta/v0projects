import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ChecksIcon,
  PlusIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { getStatusVisual } from "@/components/status/status-config";
import { buttonVariants } from "@/components/ui/button";
import { getSessionInfo } from "@/lib/auth/session";
import { formatDateBR } from "@/lib/formatters/date";
import { RESPONSIBLE_LABELS } from "@/lib/labels";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildTaskItem, dependencyFor } from "@/lib/tasks/view-model";
import {
  TASK_VIEWS,
  TASK_VIEW_LABELS,
  buildBeforeBirthView,
  buildCalendarMonth,
  buildWeekView,
  compareTasks,
  groupTasksByResponsible,
  groupTasksByStatus,
  parseCalendarMonth,
  parseTaskView,
  tasksByDate,
  type TaskItem,
  type TaskViewKey,
} from "@/lib/tasks/views";
import { listTasks } from "@/server/repositories/tasks-repository";

import { BlockedTaskCard, TaskCard } from "./task-card";

export const metadata: Metadata = { title: "Tarefas" };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function dayHeading(date: string): string {
  return format(parseISO(date), "EEEE · dd/MM", { locale: ptBR });
}

export default async function TarefasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Tarefas
        </h1>
        <EmptyState
          icon={ChecksIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), esta tela organiza as tarefas por semana, calendário, responsável e bloqueios."
        />
      </div>
    );
  }

  const params = await searchParams;
  const view = parseTaskView(first(params.view));
  const today = new Date().toISOString().slice(0, 10);

  const supabase = await createSupabaseServerClient();
  const rows = await listTasks(supabase);
  const tasks = rows.map(buildTaskItem);
  const byId = new Map(tasks.map((task) => [task.id, task]));

  const { data: baby } = await supabase
    .from("babies")
    .select("due_date")
    .limit(1)
    .maybeSingle();
  const birthDate = (baby?.due_date as string | undefined) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            Tarefas
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Serviços, preparos e documentos com prazo e responsável.
          </p>
        </div>
        <Link
          href="/app/tarefas/nova"
          className={buttonVariants({
            className: "hidden gap-1.5 lg:inline-flex",
          })}
        >
          <PlusIcon size={18} aria-hidden="true" />
          Nova tarefa
        </Link>
      </header>

      <nav aria-label="Visões de tarefas" className="flex flex-wrap gap-1.5">
        {TASK_VIEWS.map((key) => (
          <Link
            key={key}
            href={
              key === "semana" ? "/app/tarefas" : `/app/tarefas?view=${key}`
            }
            aria-current={view === key ? "page" : undefined}
            className={
              view === key
                ? "inline-flex min-h-11 items-center rounded-full bg-moss-700 px-4 text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "inline-flex min-h-11 items-center rounded-full border border-sand bg-surface px-4 text-sm font-medium text-text-secondary outline-none hover:border-sage-300 hover:text-forest-900 focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            {TASK_VIEW_LABELS[key]}
          </Link>
        ))}
      </nav>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ChecksIcon}
          title="Nenhuma tarefa ainda"
          description="Crie a primeira tarefa do enxoval — lavagens, montagens, consultas e documentos do Cael."
          action={
            <Link href="/app/tarefas/nova" className={buttonVariants()}>
              Criar tarefa
            </Link>
          }
        />
      ) : (
        <ViewContent
          view={view}
          tasks={tasks}
          byId={byId}
          today={today}
          birthDate={birthDate}
          monthParam={first(params.mes)}
          dayParam={first(params.dia)}
        />
      )}

      <Link
        href="/app/tarefas/nova"
        aria-label="Nova tarefa"
        className={buttonVariants({
          size: "icon",
          className:
            "fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 size-14 rounded-full shadow-[0_6px_20px_rgba(41,53,44,0.25)] lg:hidden",
        })}
      >
        <PlusIcon size={24} aria-hidden="true" />
      </Link>
    </div>
  );
}

function ViewContent({
  view,
  tasks,
  byId,
  today,
  birthDate,
  monthParam,
  dayParam,
}: {
  view: TaskViewKey;
  tasks: TaskItem[];
  byId: Map<string, TaskItem>;
  today: string;
  birthDate: string | null;
  monthParam: string | undefined;
  dayParam: string | undefined;
}) {
  switch (view) {
    case "semana":
      return <WeekSection tasks={tasks} today={today} />;
    case "calendario":
      return (
        <CalendarSection
          tasks={tasks}
          today={today}
          monthParam={monthParam}
          dayParam={dayParam}
        />
      );
    case "lista":
      return (
        <ul className="flex flex-col gap-2">
          {[...tasks].sort(compareTasks).map((task) => (
            <li key={task.id}>
              <TaskCard task={task} today={today} />
            </li>
          ))}
        </ul>
      );
    case "status":
      return (
        <div className="flex flex-col gap-6">
          {groupTasksByStatus(tasks).map((group) => (
            <section key={group.status} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-text-secondary uppercase">
                {getStatusVisual("tarefa", group.status).label} ·{" "}
                {group.tasks.length}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.tasks.map((task) => (
                  <li key={task.id}>
                    <TaskCard task={task} today={today} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      );
    case "responsavel":
      return (
        <div className="flex flex-col gap-6">
          {groupTasksByResponsible(tasks).map((group) => (
            <section key={group.responsible} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-text-secondary uppercase">
                {RESPONSIBLE_LABELS[group.responsible]} · {group.tasks.length}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.tasks.map((task) => (
                  <li key={task.id}>
                    <TaskCard task={task} today={today} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      );
    case "bloqueadas": {
      const blocked = tasks
        .filter((task) => task.status === "bloqueada")
        .sort(compareTasks);
      if (blocked.length === 0) {
        return (
          <EmptyState
            icon={ChecksIcon}
            title="Nada bloqueado"
            description="Nenhuma tarefa espera outra pessoa ou etapa. Quando algo travar, aparece aqui com a ação para destravar."
          />
        );
      }
      return (
        <ul className="flex flex-col gap-2">
          {blocked.map((task) => (
            <li key={task.id}>
              <BlockedTaskCard
                task={task}
                dependency={dependencyFor(task, byId)}
                today={today}
              />
            </li>
          ))}
        </ul>
      );
    }
    case "antes_do_parto": {
      if (!birthDate) {
        return (
          <EmptyState
            icon={CalendarBlankIcon}
            title="Sem data prevista cadastrada"
            description="Cadastre a data prevista do parto no onboarding para ver o que precisa acontecer antes dela."
          />
        );
      }
      const beforeBirth = buildBeforeBirthView(tasks, birthDate, today);
      return (
        <section className="flex flex-col gap-3">
          <p className="text-sm text-text-secondary">
            {beforeBirth.daysUntilBirth >= 0
              ? `Faltam ${beforeBirth.daysUntilBirth} dias para ${formatDateBR(birthDate)}, a data prevista.`
              : `A data prevista (${formatDateBR(birthDate)}) já passou.`}
          </p>
          {beforeBirth.tasks.length === 0 ? (
            <EmptyState
              icon={ChecksIcon}
              title="Nada pendente antes do parto"
              description="Nenhuma tarefa ativa com prazo até a data prevista. Respira: por aqui está tudo em dia."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {beforeBirth.tasks.map((task) => (
                <li key={task.id}>
                  <TaskCard task={task} today={today} />
                </li>
              ))}
            </ul>
          )}
        </section>
      );
    }
  }
}

function WeekSection({ tasks, today }: { tasks: TaskItem[]; today: string }) {
  const week = buildWeekView(tasks, today);
  const daysWithTasks = week.days.filter((day) => day.tasks.length > 0);
  const nothingThisWeek =
    week.overdue.length === 0 &&
    daysWithTasks.length === 0 &&
    week.undated.length === 0;

  if (nothingThisWeek) {
    return (
      <EmptyState
        icon={CalendarBlankIcon}
        title="Semana livre"
        description={`Nada com prazo entre ${formatDateBR(week.range.start)} e ${formatDateBR(week.range.end)}, nada atrasado e nada sem prazo.`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-text-secondary">
        Semana de {formatDateBR(week.range.start)} a{" "}
        {formatDateBR(week.range.end)}.
      </p>
      {week.overdue.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-danger-strong uppercase">
            Atrasadas · {week.overdue.length}
          </h2>
          <ul className="flex flex-col gap-2">
            {week.overdue.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} today={today} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {daysWithTasks.map((day) => (
        <section key={day.date} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-text-secondary uppercase first-letter:uppercase">
            {dayHeading(day.date)}
            {day.date === today ? " · hoje" : ""}
          </h2>
          <ul className="flex flex-col gap-2">
            {day.tasks.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} today={today} hideDate />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {week.undated.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-text-secondary uppercase">
            Sem prazo · {week.undated.length}
          </h2>
          <ul className="flex flex-col gap-2">
            {week.undated.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} today={today} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

const WEEKDAY_HEADERS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

function CalendarSection({
  tasks,
  today,
  monthParam,
  dayParam,
}: {
  tasks: TaskItem[];
  today: string;
  monthParam: string | undefined;
  dayParam: string | undefined;
}) {
  const month = parseCalendarMonth(monthParam, today);
  const calendar = buildCalendarMonth(month);
  const byDate = tasksByDate(tasks);
  const selectedDay =
    dayParam && /^\d{4}-\d{2}-\d{2}$/.test(dayParam) ? dayParam : null;

  const monthLabel = format(parseISO(`${month}-01`), "MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const monthDays = calendar.weeks
    .flat()
    .filter((day) => day.inMonth && byDate.has(day.date))
    .map((day) => ({ date: day.date, tasks: byDate.get(day.date)! }));

  const listed = selectedDay
    ? monthDays.filter((day) => day.date === selectedDay)
    : monthDays;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/app/tarefas?view=calendario&mes=${calendar.previous}`}
          aria-label="Mês anterior"
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <CaretLeftIcon size={18} aria-hidden="true" />
        </Link>
        <h2 className="font-display text-xl font-semibold text-forest-900 first-letter:uppercase">
          {monthLabel}
        </h2>
        <Link
          href={`/app/tarefas?view=calendario&mes=${calendar.next}`}
          aria-label="Próximo mês"
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <CaretRightIcon size={18} aria-hidden="true" />
        </Link>
      </div>

      <div className="rounded-lg border border-sand/70 bg-card p-2">
        <div className="grid grid-cols-7 text-center text-xs font-medium text-text-secondary">
          {WEEKDAY_HEADERS.map((label) => (
            <span key={label} className="py-1.5">
              {label}
            </span>
          ))}
        </div>
        {calendar.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((day) => {
              const dayTasks = day.inMonth ? byDate.get(day.date) : undefined;
              const dayNumber = Number(day.date.slice(8, 10));
              const isToday = day.date === today;
              const isSelected = day.date === selectedDay;
              const baseClasses =
                "relative m-0.5 flex min-h-11 flex-col items-center justify-center rounded-md text-sm";
              if (!day.inMonth) {
                return (
                  <span
                    key={day.date}
                    aria-hidden="true"
                    className={`${baseClasses} text-text-secondary/40`}
                  >
                    {dayNumber}
                  </span>
                );
              }
              if (!dayTasks) {
                return (
                  <span
                    key={day.date}
                    className={`${baseClasses} ${isToday ? "font-semibold text-moss-700 ring-1 ring-sage-300" : "text-forest-900"}`}
                  >
                    {dayNumber}
                  </span>
                );
              }
              return (
                <Link
                  key={day.date}
                  href={`/app/tarefas?view=calendario&mes=${month}&dia=${day.date}`}
                  aria-label={`${formatDateBR(day.date)}, ${dayTasks.length} ${dayTasks.length === 1 ? "tarefa" : "tarefas"}`}
                  aria-current={isSelected ? "date" : undefined}
                  className={`${baseClasses} font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelected
                      ? "bg-moss-700 text-white"
                      : "bg-sage-100 text-forest-900 hover:bg-sage-300/60"
                  } ${isToday && !isSelected ? "ring-1 ring-sage-300" : ""}`}
                >
                  {dayNumber}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-1 size-1.5 rounded-full ${isSelected ? "bg-white" : "bg-moss-700"}`}
                  />
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {selectedDay ? (
        <Link
          href={`/app/tarefas?view=calendario&mes=${month}`}
          className="text-sm font-medium text-moss-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          Mostrar o mês inteiro
        </Link>
      ) : null}

      {listed.length === 0 ? (
        <EmptyState
          icon={CalendarBlankIcon}
          title={
            selectedDay
              ? `Nada em ${formatDateBR(selectedDay)}`
              : "Mês sem prazos"
          }
          description="Nenhuma tarefa com prazo neste período."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {listed.map((day) => (
            <section key={day.date} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold tracking-wide text-text-secondary uppercase first-letter:uppercase">
                {dayHeading(day.date)}
              </h3>
              <ul className="flex flex-col gap-2">
                {day.tasks.map((task) => (
                  <li key={task.id}>
                    <TaskCard task={task} today={today} hideDate />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
