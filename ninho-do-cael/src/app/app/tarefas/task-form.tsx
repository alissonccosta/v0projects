"use client";

import * as React from "react";

import { FormField } from "@/components/form-field";
import { getStatusVisual } from "@/components/status/status-config";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type ActionState } from "@/lib/auth/action-state";
import {
  CATEGORY_LABELS,
  RESPONSIBLE_LABELS,
  TASK_TYPE_LABELS,
} from "@/lib/labels";
import type { TaskItem } from "@/lib/tasks/views";
import { EDITABLE_TASK_STATUSES } from "@/lib/validation/tasks";
import { CATEGORIES, RESPONSIBLE_PARTIES, TASK_TYPES } from "@/types/domain";

export type NeedOption = { id: string; title: string };
export type TaskOption = { id: string; title: string };

export function TaskForm({
  action,
  task,
  needOptions,
  taskOptions,
  preselectedNeedIds = [],
  submitLabel,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>;
  task?: TaskItem;
  needOptions: NeedOption[];
  /** Tarefas disponíveis como dependência (sem a própria). */
  taskOptions: TaskOption[];
  preselectedNeedIds?: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(action, { status: "idle" });
  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const checkedNeeds = new Set(
    task ? task.needs.map((need) => need.id) : preselectedNeedIds,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormField
        id="title"
        name="title"
        label="Título"
        required
        defaultValue={task?.title}
        placeholder="Ex.: Lavar as roupas 0–3 meses"
        error={fieldErrors.title}
        disabled={pending}
      />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Classificação</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="campo-type">Tipo</Label>
          <Select
            id="campo-type"
            name="type"
            defaultValue={task?.type ?? "tarefa"}
            disabled={pending}
          >
            {TASK_TYPES.map((value) => (
              <option key={value} value={value}>
                {TASK_TYPE_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="campo-category">Categoria</Label>
          <Select
            id="campo-category"
            name="category"
            defaultValue={task?.category ?? ""}
            disabled={pending}
          >
            <option value="">Sem categoria</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="campo-status">Status</Label>
          <Select
            id="campo-status"
            name="status"
            defaultValue={
              task && task.status !== "concluida" ? task.status : "planejada"
            }
            aria-invalid={fieldErrors.status ? true : undefined}
            disabled={pending}
          >
            {EDITABLE_TASK_STATUSES.map((value) => (
              <option key={value} value={value}>
                {getStatusVisual("tarefa", value).label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-text-secondary">
            Concluir tem fluxo próprio, com o critério confirmado.
          </p>
          {fieldErrors.status ? (
            <p role="alert" className="text-sm text-danger-strong">
              {fieldErrors.status}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="campo-responsible">Responsável</Label>
          <Select
            id="campo-responsible"
            name="responsible"
            defaultValue={task?.responsible ?? "casal"}
            disabled={pending}
          >
            {RESPONSIBLE_PARTIES.map((value) => (
              <option key={value} value={value}>
                {RESPONSIBLE_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="sr-only">Prazos e custo</legend>
        <FormField
          id="due_date"
          name="due_date"
          type="date"
          label="Prazo"
          defaultValue={task?.dueDate ?? undefined}
          error={fieldErrors.due_date}
          disabled={pending}
        />
        <FormField
          id="window_start"
          name="window_start"
          type="date"
          label="Início do intervalo"
          defaultValue={task?.windowStart ?? undefined}
          error={fieldErrors.window_start}
          disabled={pending}
        />
        <FormField
          id="window_end"
          name="window_end"
          type="date"
          label="Fim do intervalo"
          defaultValue={task?.windowEnd ?? undefined}
          error={fieldErrors.window_end}
          disabled={pending}
        />
        <FormField
          id="estimated_cost"
          name="estimated_cost"
          type="number"
          label="Custo estimado (R$)"
          defaultValue={task?.estimatedCost?.toString()}
          error={fieldErrors.estimated_cost}
          disabled={pending}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Dependência e bloqueio</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="campo-depends">Depende da tarefa</Label>
          <Select
            id="campo-depends"
            name="depends_on_task_id"
            defaultValue={task?.dependsOnTaskId ?? ""}
            aria-invalid={fieldErrors.depends_on_task_id ? true : undefined}
            disabled={pending}
          >
            <option value="">Sem dependência</option>
            {taskOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </Select>
          {fieldErrors.depends_on_task_id ? (
            <p role="alert" className="text-sm text-danger-strong">
              {fieldErrors.depends_on_task_id}
            </p>
          ) : null}
        </div>
        <FormField
          id="blocked_reason"
          name="blocked_reason"
          label="O que bloqueia"
          placeholder="Ex.: aguarda a entrega do berço"
          defaultValue={task?.blockedReason ?? undefined}
          error={fieldErrors.blocked_reason}
          disabled={pending}
        />
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="completion_criteria">Critério de conclusão</Label>
        <Textarea
          id="completion_criteria"
          name="completion_criteria"
          defaultValue={task?.completionCriteria ?? undefined}
          placeholder="Como saber que está pronta? Ex.: roupas lavadas, secas e guardadas na cômoda."
          disabled={pending}
        />
        <p className="text-xs text-text-secondary">
          É este critério que você confirma na hora de concluir.
        </p>
        {fieldErrors.completion_criteria ? (
          <p role="alert" className="text-sm text-danger-strong">
            {fieldErrors.completion_criteria}
          </p>
        ) : null}
      </div>

      {needOptions.length > 0 ? (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-forest-900">
            Necessidades vinculadas
          </legend>
          <div className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-md border border-input bg-surface p-2">
            {needOptions.map((need) => (
              <label
                key={need.id}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm px-2 text-sm text-forest-900 hover:bg-canvas"
              >
                <input
                  type="checkbox"
                  name="need_ids"
                  value={need.id}
                  defaultChecked={checkedNeeds.has(need.id)}
                  disabled={pending}
                  className="size-4 accent-moss-700"
                />
                {need.title}
              </label>
            ))}
          </div>
          <p className="text-xs text-text-secondary">
            A tarefa aparece no detalhe de cada necessidade marcada.
          </p>
        </fieldset>
      ) : null}

      {state.status === "error" && !state.fieldErrors ? (
        <p
          role="alert"
          className="rounded-md bg-danger-soft p-3 text-sm text-danger-strong"
        >
          {state.message}
        </p>
      ) : null}

      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-1 rounded-md bg-canvas/95 p-1 lg:static lg:m-0 lg:bg-transparent lg:p-0">
        <Button type="submit" disabled={pending} className="w-full lg:w-auto">
          {pending ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
