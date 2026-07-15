import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSessionInfo } from "@/lib/auth/session";
import { criarTarefa } from "@/lib/tasks/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listNeeds } from "@/server/repositories/needs-repository";
import { listTasks } from "@/server/repositories/tasks-repository";

import { TaskForm } from "../task-form";

export const metadata: Metadata = { title: "Nova tarefa" };

export default async function NovaTarefaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSessionInfo();
  if (session.mode !== "member") {
    redirect("/app/tarefas");
  }

  const params = await searchParams;
  const rawNeed = Array.isArray(params.necessidade)
    ? params.necessidade[0]
    : params.necessidade;
  const preselectedNeedIds =
    rawNeed && z.uuid().safeParse(rawNeed).success ? [rawNeed] : [];

  const supabase = await createSupabaseServerClient();
  const [needs, tasks] = await Promise.all([
    listNeeds(supabase),
    listTasks(supabase),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/app/tarefas"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Tarefas
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest-900">
          Nova tarefa
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Lavagens, montagens, consultas, documentos — com prazo, critério e
          responsável.
        </p>
      </div>
      <TaskForm
        action={criarTarefa}
        needOptions={needs
          .filter((need) => need.archived_at === null)
          .map((need) => ({ id: need.id, title: need.title }))}
        taskOptions={tasks.map((task) => ({ id: task.id, title: task.title }))}
        preselectedNeedIds={preselectedNeedIds}
        submitLabel="Criar tarefa"
      />
    </div>
  );
}
