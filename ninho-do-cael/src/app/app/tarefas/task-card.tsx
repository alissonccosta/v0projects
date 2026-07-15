import {
  ArrowElbowDownRightIcon,
  LinkSimpleIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { StatusBadge } from "@/components/status/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/formatters/currency";
import { formatDateBR } from "@/lib/formatters/date";
import { RESPONSIBLE_LABELS, TASK_TYPE_LABELS } from "@/lib/labels";
import {
  blockedInfo,
  isTaskOverdue,
  responsibleLabel,
  type TaskDependency,
  type TaskItem,
} from "@/lib/tasks/views";

/** Card de tarefa usado em todas as visões (seção 20). */
export function TaskCard({
  task,
  today,
  hideDate = false,
}: {
  task: TaskItem;
  today: string;
  hideDate?: boolean;
}) {
  const overdue = isTaskOverdue(task, today);
  return (
    <Link
      href={`/app/tarefas/${task.id}`}
      className="flex flex-col gap-2 rounded-lg border border-sand/70 bg-card p-4 shadow-[0_1px_2px_rgba(41,53,44,0.05)] transition-colors duration-150 outline-none hover:border-sage-300 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-semibold text-forest-900">{task.title}</p>
        <StatusBadge domain="tarefa" value={task.status} size="sm" />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
        {task.type !== "tarefa" ? (
          <Badge tone="outline">{TASK_TYPE_LABELS[task.type]}</Badge>
        ) : null}
        {overdue ? <Badge tone="danger">Vencida</Badge> : null}
        {!hideDate && task.dueDate ? (
          <span className={overdue ? "font-medium text-danger-strong" : ""}>
            até {formatDateBR(task.dueDate)}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <UserIcon size={14} aria-hidden="true" />
          {RESPONSIBLE_LABELS[task.responsible]}
        </span>
        {task.needs.length > 0 ? (
          <span className="inline-flex items-center gap-1">
            <LinkSimpleIcon size={14} aria-hidden="true" />
            {task.needs.length === 1
              ? task.needs[0]!.title
              : `${task.needs.length} necessidades`}
          </span>
        ) : null}
        {task.actualCost !== null ? (
          <span>{formatBRL(task.actualCost)}</span>
        ) : task.estimatedCost !== null ? (
          <span>~{formatBRL(task.estimatedCost)}</span>
        ) : null}
      </div>
    </Link>
  );
}

/**
 * Card expandido da visão Bloqueadas (seção 20): dependência, bloqueador,
 * ação e responsável — tudo visível sem abrir o detalhe.
 */
export function BlockedTaskCard({
  task,
  dependency,
  today,
}: {
  task: TaskItem;
  dependency: TaskDependency;
  today: string;
}) {
  const info = blockedInfo(task, dependency);
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-danger/25 bg-card p-4 shadow-[0_1px_2px_rgba(41,53,44,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/app/tarefas/${task.id}`}
          className="min-w-0 font-semibold text-forest-900 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {task.title}
        </Link>
        <StatusBadge domain="tarefa" value={task.status} size="sm" />
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-text-secondary">Dependência</dt>
          <dd className="font-medium text-forest-900">
            {info.dependencyTitle ?? "Nenhuma registrada"}
            {info.dependencyDone ? " · concluída" : ""}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">Bloqueador</dt>
          <dd className="font-medium text-forest-900">
            {info.blocker ?? "Sem motivo registrado"}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">Ação para destravar</dt>
          <dd className="inline-flex items-center gap-1 font-medium text-forest-900">
            <ArrowElbowDownRightIcon
              size={14}
              aria-hidden="true"
              className="text-moss-700"
            />
            {info.action}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">Responsável pela ação</dt>
          <dd className="font-medium text-forest-900">
            {responsibleLabel(info.actionResponsible)}
          </dd>
        </div>
      </dl>
      {task.dueDate ? (
        <p
          className={
            isTaskOverdue(task, today)
              ? "text-sm font-medium text-danger-strong"
              : "text-sm text-text-secondary"
          }
        >
          Prazo: {formatDateBR(task.dueDate)}
        </p>
      ) : null}
    </div>
  );
}
