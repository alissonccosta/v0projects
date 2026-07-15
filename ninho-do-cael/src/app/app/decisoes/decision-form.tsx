"use client";

import { StethoscopeIcon } from "@phosphor-icons/react/dist/ssr";
import * as React from "react";

import { FormField } from "@/components/form-field";
import { getStatusVisual } from "@/components/status/status-config";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type ActionState } from "@/lib/auth/action-state";
import { MEDICAL_DECISION_NOTICE } from "@/lib/decisions/model";
import type { DecisionItem } from "@/lib/decisions/view-model";
import {
  CONFIDENCE_LABELS,
  DECISION_TYPE_LABELS,
  RESPONSIBLE_LABELS,
} from "@/lib/labels";
import { EDITABLE_DECISION_STATUSES } from "@/lib/validation/decisions";
import {
  DECISION_CONFIDENCES,
  DECISION_TYPES,
  RESPONSIBLE_PARTIES,
} from "@/types/domain";

export type NeedOption = { id: string; title: string };

export function DecisionForm({
  action,
  decision,
  needOptions,
  preselectedNeedIds = [],
  submitLabel,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>;
  decision?: DecisionItem;
  needOptions: NeedOption[];
  preselectedNeedIds?: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(action, { status: "idle" });
  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const [type, setType] = React.useState<string>(decision?.type ?? "familiar");
  const checkedNeeds = new Set(
    decision ? decision.needs.map((need) => need.id) : preselectedNeedIds,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormField
        id="title"
        name="title"
        label="Título"
        required
        defaultValue={decision?.title}
        placeholder="Ex.: Qual cadeirinha para o carro?"
        error={fieldErrors.title}
        disabled={pending}
      />

      <FormField
        id="pending_question"
        name="pending_question"
        label="Pergunta em aberto"
        defaultValue={decision?.pendingQuestion ?? undefined}
        placeholder="O que exatamente falta responder?"
        error={fieldErrors.pending_question}
        disabled={pending}
      />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Classificação</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="campo-type">Tipo</Label>
          <Select
            id="campo-type"
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            disabled={pending}
          >
            {DECISION_TYPES.map((value) => (
              <option key={value} value={value}>
                {DECISION_TYPE_LABELS[value]}
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
              decision && decision.status !== "decidida"
                ? decision.status
                : "pendente"
            }
            aria-invalid={fieldErrors.status ? true : undefined}
            disabled={pending}
          >
            {EDITABLE_DECISION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {getStatusVisual("decisao", value).label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-text-secondary">
            Marcar como decidida tem fluxo próprio, com a conclusão registrada.
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
            defaultValue={decision?.responsible ?? "casal"}
            disabled={pending}
          >
            {RESPONSIBLE_PARTIES.map((value) => (
              <option key={value} value={value}>
                {RESPONSIBLE_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="campo-confidence">Confiança</Label>
          <Select
            id="campo-confidence"
            name="confidence"
            defaultValue={decision?.confidence ?? ""}
            disabled={pending}
          >
            <option value="">Sem registro</option>
            {DECISION_CONFIDENCES.map((value) => (
              <option key={value} value={value}>
                {CONFIDENCE_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
        <FormField
          id="due_date"
          name="due_date"
          type="date"
          label="Prazo"
          defaultValue={decision?.dueDate ?? undefined}
          error={fieldErrors.due_date}
          disabled={pending}
        />
        <FormField
          id="impact"
          name="impact"
          label="Impacto"
          placeholder="O que essa decisão trava ou libera?"
          defaultValue={decision?.impact ?? undefined}
          error={fieldErrors.impact}
          disabled={pending}
        />
      </fieldset>

      {type === "medica" ? (
        <p className="flex items-start gap-2.5 rounded-md bg-info-soft p-3 text-sm leading-relaxed text-forest-900">
          <StethoscopeIcon
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-moss-700"
          />
          {MEDICAL_DECISION_NOTICE}
        </p>
      ) : null}

      <FormField
        id="source"
        name="source"
        label="Fonte"
        placeholder="Quem orientou ou onde vocês pesquisaram"
        defaultValue={decision?.source ?? undefined}
        error={fieldErrors.source}
        disabled={pending}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rationale">Justificativa</Label>
        <Textarea
          id="rationale"
          name="rationale"
          defaultValue={decision?.rationale ?? undefined}
          placeholder="Critérios, comparações, contexto…"
          disabled={pending}
        />
        {fieldErrors.rationale ? (
          <p role="alert" className="text-sm text-danger-strong">
            {fieldErrors.rationale}
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
            A decisão aparece no detalhe de cada necessidade marcada.
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
