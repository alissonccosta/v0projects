import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getSessionInfo } from "@/lib/auth/session";
import { editarTarefa } from "@/lib/tasks/actions";
import { buildTaskItem } from "@/lib/tasks/view-model";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listNeeds } from "@/server/repositories/needs-repository";
import { getTaskById, listTasks } from "@/server/repositories/tasks-repository";

import { TaskForm } from "../../task-form";

export const metadata: Metadata = { title: "Editar tarefa" };

export default async function EditarTarefaPage({
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

  const [needs, tasks] = await Promise.all([
    listNeeds(supabase),
    listTasks(supabase),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href={`/app/tarefas/${task.id}`}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          {task.title}
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest-900">
          Editar tarefa
        </h1>
      </div>
      <TaskForm
        action={editarTarefa.bind(null, task.id)}
        task={task}
        needOptions={needs
          .filter((need) => need.archived_at === null)
          .map((need) => ({ id: need.id, title: need.title }))}
        taskOptions={tasks
          .filter((option) => option.id !== task.id)
          .map((option) => ({ id: option.id, title: option.title }))}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
