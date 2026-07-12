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
  AUDIENCE_LABELS,
  CATEGORY_LABELS,
  NEED_TYPE_LABELS,
  PHASE_LABELS,
  PRIORITY_LABELS,
  RESPONSIBLE_LABELS,
} from "@/lib/labels";
import type { NeedViewModel } from "@/lib/needs/view-model";
import {
  ACQUISITION_STATUSES,
  CATEGORIES,
  CRITICALITIES,
  LOGISTICS_STATUSES,
  NEED_AUDIENCES,
  NEED_DECISION_STATUSES,
  NEED_TYPES,
  PRIORITIES,
  READINESS_STATUSES,
  RESPONSIBLE_PARTIES,
  USAGE_PHASES,
} from "@/types/domain";

type SelectSpec = {
  name: string;
  label: string;
  options: ReadonlyArray<string>;
  optionLabel: (value: string) => string;
  defaultValue: string;
};

function SelectField({
  spec,
  error,
  disabled,
}: {
  spec: SelectSpec;
  error?: string;
  disabled?: boolean;
}) {
  const id = `campo-${spec.name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{spec.label}</Label>
      <Select
        id={id}
        name={spec.name}
        defaultValue={spec.defaultValue}
        aria-invalid={error ? true : undefined}
        disabled={disabled}
      >
        {spec.options.map((option) => (
          <option key={option} value={option}>
            {spec.optionLabel(option)}
          </option>
        ))}
      </Select>
      {error ? (
        <p role="alert" className="text-sm text-danger-strong">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function NeedForm({
  action,
  need,
  submitLabel,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>;
  need?: NeedViewModel;
  submitLabel: string;
}) {
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(action, { status: "idle" });
  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const selects: SelectSpec[] = [
    {
      name: "type",
      label: "Tipo",
      options: NEED_TYPES,
      optionLabel: (v) => NEED_TYPE_LABELS[v as keyof typeof NEED_TYPE_LABELS],
      defaultValue: need?.type ?? "produto",
    },
    {
      name: "audience",
      label: "Público",
      options: NEED_AUDIENCES,
      optionLabel: (v) => AUDIENCE_LABELS[v as keyof typeof AUDIENCE_LABELS],
      defaultValue: need?.audience ?? "bebe",
    },
    {
      name: "category",
      label: "Categoria",
      options: CATEGORIES,
      optionLabel: (v) => CATEGORY_LABELS[v as keyof typeof CATEGORY_LABELS],
      defaultValue: need?.category ?? "sono",
    },
    {
      name: "phase",
      label: "Fase de uso",
      options: USAGE_PHASES,
      optionLabel: (v) => PHASE_LABELS[v as keyof typeof PHASE_LABELS],
      defaultValue: need?.phase ?? "antes_do_parto",
    },
    {
      name: "criticality",
      label: "Criticidade",
      options: CRITICALITIES,
      optionLabel: (v) => getStatusVisual("criticidade", v as never).label,
      defaultValue: need?.criticality ?? "media",
    },
    {
      name: "priority",
      label: "Prioridade",
      options: PRIORITIES,
      optionLabel: (v) => PRIORITY_LABELS[v as keyof typeof PRIORITY_LABELS],
      defaultValue: need?.priority ?? "media",
    },
    {
      name: "decision_status",
      label: "Status da decisão",
      options: NEED_DECISION_STATUSES,
      optionLabel: (v) =>
        getStatusVisual("decisaoNecessidade", v as never).label,
      defaultValue: need?.decisionStatus ?? "precisa_pesquisar",
    },
    {
      name: "acquisition_status",
      label: "Status da aquisição",
      options: ACQUISITION_STATUSES,
      optionLabel: (v) => getStatusVisual("aquisicao", v as never).label,
      defaultValue: need?.acquisitionStatus ?? "aguardar",
    },
    {
      name: "logistics_status",
      label: "Status logístico",
      options: LOGISTICS_STATUSES,
      optionLabel: (v) => getStatusVisual("logistica", v as never).label,
      defaultValue: need?.logisticsStatus ?? "nao_aplicavel",
    },
    {
      name: "readiness_status",
      label: "Status de prontidão",
      options: READINESS_STATUSES,
      optionLabel: (v) => getStatusVisual("prontidao", v as never).label,
      defaultValue: need?.readinessStatus ?? "pendente",
    },
    {
      name: "responsible",
      label: "Responsável",
      options: RESPONSIBLE_PARTIES,
      optionLabel: (v) =>
        RESPONSIBLE_LABELS[v as keyof typeof RESPONSIBLE_LABELS],
      defaultValue: need?.responsible ?? "casal",
    },
  ];

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormField
        id="title"
        name="title"
        label="Título"
        required
        defaultValue={need?.title}
        placeholder="Ex.: Berço montessoriano"
        error={fieldErrors.title}
        disabled={pending}
      />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Classificação</legend>
        {selects.map((spec) => (
          <SelectField
            key={spec.name}
            spec={spec}
            error={fieldErrors[spec.name]}
            disabled={pending}
          />
        ))}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="sr-only">Quantidades e valores</legend>
        <FormField
          id="required_quantity"
          name="required_quantity"
          type="number"
          label="Quantidade necessária"
          defaultValue={need?.requiredQuantity?.toString()}
          error={fieldErrors.required_quantity}
          disabled={pending}
        />
        <FormField
          id="available_quantity"
          name="available_quantity"
          type="number"
          label="Quantidade disponível"
          defaultValue={need?.availableQuantity?.toString()}
          error={fieldErrors.available_quantity}
          disabled={pending}
        />
        <FormField
          id="unit"
          name="unit"
          label="Unidade"
          placeholder="un, pacote…"
          defaultValue={need?.unit ?? undefined}
          error={fieldErrors.unit}
          disabled={pending}
        />
        <FormField
          id="estimated_price"
          name="estimated_price"
          type="number"
          label="Preço estimado (R$)"
          defaultValue={need?.estimatedPrice?.toString()}
          error={fieldErrors.estimated_price}
          disabled={pending}
        />
        <FormField
          id="paid_price"
          name="paid_price"
          type="number"
          label="Preço pago (R$)"
          defaultValue={need?.paidPrice?.toString()}
          error={fieldErrors.paid_price}
          disabled={pending}
        />
        <FormField
          id="due_date"
          name="due_date"
          type="date"
          label="Data limite"
          defaultValue={need?.dueDate ?? undefined}
          error={fieldErrors.due_date}
          disabled={pending}
        />
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit_notes">Observações</Label>
        <Textarea
          id="audit_notes"
          name="audit_notes"
          defaultValue={need?.auditNotes ?? undefined}
          placeholder="Contexto, medidas, restrições…"
          disabled={pending}
        />
        {fieldErrors.audit_notes ? (
          <p role="alert" className="text-sm text-danger-strong">
            {fieldErrors.audit_notes}
          </p>
        ) : null}
      </div>

      {state.status === "error" && !state.fieldErrors ? (
        <p
          role="alert"
          className="rounded-md bg-danger-soft p-3 text-sm text-danger-strong"
        >
          {state.message}
        </p>
      ) : null}

      {/* Botão sempre visível acima do teclado no mobile (seção 13.2) */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-1 rounded-md bg-canvas/95 p-1 lg:static lg:m-0 lg:bg-transparent lg:p-0">
        <Button type="submit" disabled={pending} className="w-full lg:w-auto">
          {pending ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
