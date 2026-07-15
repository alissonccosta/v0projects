import {
  ArrowLeftIcon,
  ClockCounterClockwiseIcon,
  LinkSimpleIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { StatusBadge } from "@/components/status/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSessionInfo } from "@/lib/auth/session";
import { formatBRL } from "@/lib/formatters/currency";
import { formatDateBR } from "@/lib/formatters/date";
import {
  CATEGORY_LABELS,
  RESPONSIBLE_LABELS,
  TASK_TYPE_LABELS,
} from "@/lib/labels";
import { buildTaskItem } from "@/lib/tasks/view-model";
import {
  blockedInfo,
  isTaskOverdue,
  responsibleLabel,
  type TaskDependency,
} from "@/lib/tasks/views";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listEntityActivity } from "@/server/repositories/activity-repository";
import {
  getTaskById,
  listDependentTasks,
} from "@/server/repositories/tasks-repository";
import type { ResponsibleParty, TaskStatus } from "@/types/domain";

import { TaskActions } from "./task-actions";

export const metadata: Metadata = { title: "Tarefa" };

const ACTIVITY_LABELS: Record<string, string> = {
  criacao: "criou",
  atualizacao: "atualizou",
  arquivamento: "arquivou",
  restauracao: "restaurou",
  conclusao: "concluiu",
  sincronizacao: "sincronizou",
  importacao: "importou",
  exclusao: "excluiu",
};

export default async function TarefaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const session = await getSessionInfo();
  if (session.mode !== "member") {
    redirect("/app/tarefas");
  }

  const supabase = await createSupabaseServerClient();
  const row = await getTaskById(supabase, id);
  if (!row) {
    notFound();
  }
  const task = buildTaskItem(row);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = isTaskOverdue(task, today);

  const [dependencyRow, dependents, activity] = await Promise.all([
    task.dependsOnTaskId
      ? getTaskById(supabase, task.dependsOnTaskId)
      : Promise.resolve(null),
    listDependentTasks(supabase, id),
    listEntityActivity(supabase, "task", id),
  ]);
  const dependency: TaskDependency = dependencyRow
    ? {
        id: dependencyRow.id,
        title: dependencyRow.title,
        status: dependencyRow.status as TaskStatus,
        responsible: dependencyRow.responsible as ResponsibleParty,
      }
    : null;
  const blocked = task.status === "bloqueada";
  const info = blocked ? blockedInfo(task, dependency) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/app/tarefas"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Tarefas
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            {task.title}
          </h1>
          <Link
            href={`/app/tarefas/${task.id}/editar`}
            className={buttonVariants({
              variant: "outline",
              className: "gap-1.5",
            })}
          >
            <PencilSimpleIcon size={18} aria-hidden="true" />
            Editar
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusBadge domain="tarefa" value={task.status} size="sm" />
          <Badge tone="outline">{TASK_TYPE_LABELS[task.type]}</Badge>
          {overdue ? <Badge tone="danger">Vencida</Badge> : null}
        </div>
      </div>

      {blocked && info ? (
        <Card className="border-danger/25">
          <CardHeader>
            <CardTitle>Por que está bloqueada</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-text-secondary">Dependência</dt>
                <dd className="font-medium text-forest-900">
                  {dependency ? (
                    <Link
                      href={`/app/tarefas/${dependency.id}`}
                      className="underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {dependency.title}
                    </Link>
                  ) : (
                    "Nenhuma registrada"
                  )}
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
                <dd className="font-medium text-forest-900">{info.action}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Responsável pela ação</dt>
                <dd className="font-medium text-forest-900">
                  {responsibleLabel(info.actionResponsible)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-text-secondary">Responsável</dt>
              <dd className="font-medium text-forest-900">
                {RESPONSIBLE_LABELS[task.responsible]}
              </dd>
            </div>
            {task.category ? (
              <div>
                <dt className="text-text-secondary">Categoria</dt>
                <dd className="font-medium text-forest-900">
                  {CATEGORY_LABELS[task.category]}
                </dd>
              </div>
            ) : null}
            {task.dueDate ? (
              <div>
                <dt className="text-text-secondary">Prazo</dt>
                <dd
                  className={
                    overdue
                      ? "font-semibold text-danger-strong"
                      : "font-medium text-forest-900"
                  }
                >
                  {formatDateBR(task.dueDate)}
                </dd>
              </div>
            ) : null}
            {task.windowStart || task.windowEnd ? (
              <div>
                <dt className="text-text-secondary">Intervalo</dt>
                <dd className="font-medium text-forest-900">
                  {task.windowStart ? formatDateBR(task.windowStart) : "…"} —{" "}
                  {task.windowEnd ? formatDateBR(task.windowEnd) : "…"}
                </dd>
              </div>
            ) : null}
            {task.estimatedCost !== null ? (
              <div>
                <dt className="text-text-secondary">Custo estimado</dt>
                <dd className="font-medium text-forest-900">
                  {formatBRL(task.estimatedCost)}
                </dd>
              </div>
            ) : null}
            {task.actualCost !== null ? (
              <div>
                <dt className="text-text-secondary">Custo real</dt>
                <dd className="font-medium text-forest-900">
                  {formatBRL(task.actualCost)}
                </dd>
              </div>
            ) : null}
            {task.completedAt ? (
              <div>
                <dt className="text-text-secondary">Concluída em</dt>
                <dd className="font-medium text-forest-900">
                  {new Date(task.completedAt).toLocaleDateString("pt-BR")}
                </dd>
              </div>
            ) : null}
          </dl>

          {task.completionCriteria ? (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-text-secondary">Critério de conclusão</p>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap text-forest-900">
                  {task.completionCriteria}
                </p>
              </div>
            </>
          ) : null}

          {row.completion_notes ? (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-text-secondary">Nota da conclusão</p>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap text-forest-900">
                  {row.completion_notes}
                </p>
                {row.completion_reference ? (
                  <p className="mt-1 text-text-secondary">
                    Referência: {row.completion_reference}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <TaskActions
        taskId={task.id}
        status={task.status}
        completionCriteria={task.completionCriteria}
      />

      {(task.needs.length > 0 || dependents.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkSimpleIcon
                size={20}
                aria-hidden="true"
                className="text-moss-700"
              />
              Relacionados
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            {task.needs.length > 0 ? (
              <div>
                <p className="text-text-secondary">Necessidades vinculadas</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {task.needs.map((need) => (
                    <li key={need.id}>
                      <Link
                        href={`/app/necessidades/${need.id}`}
                        className="inline-flex min-h-11 items-center font-medium text-forest-900 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {need.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {dependents.length > 0 ? (
              <div>
                <p className="text-text-secondary">
                  Destrava estas tarefas quando concluída
                </p>
                <ul className="mt-1 flex flex-col gap-1">
                  {dependents.map((dependent) => (
                    <li key={dependent.id}>
                      <Link
                        href={`/app/tarefas/${dependent.id}`}
                        className="inline-flex min-h-11 items-center font-medium text-forest-900 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {dependent.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockCounterClockwiseIcon
              size={20}
              aria-hidden="true"
              className="text-moss-700"
            />
            Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Nenhuma alteração registrada ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {activity.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <p className="text-forest-900">
                    <span className="font-semibold">
                      {entry.actor?.display_name ?? "Sistema"}
                    </span>{" "}
                    {ACTIVITY_LABELS[entry.action] ?? entry.action}
                    {entry.origin !== "app" ? ` (via ${entry.origin})` : ""}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(entry.created_at).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                    {entry.changes && entry.action === "atualizacao"
                      ? ` · ${Object.keys(entry.changes).length} campo(s)`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
