"use client";

import * as React from "react";

import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { idleState, type ActionState } from "@/lib/auth/action-state";
import { completeOnboarding } from "@/lib/auth/actions";

/** Valores do SDD como ponto de partida — tudo editável. */
const DEFAULTS = {
  householdName: "Ninho do Cael",
  babyName: "Cael",
  dueDate: "2026-11-15",
  birthType: "Cesárea",
  maternity: "Santa Luiza / Unimed",
  city: "Itajaí",
  state: "SC",
};

export function OnboardingForm() {
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(completeOnboarding, idleState);
  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FormField
        id="displayName"
        name="displayName"
        label="Seu nome"
        required
        autoComplete="name"
        error={fieldErrors.displayName}
        disabled={pending}
      />
      <FormField
        id="householdName"
        name="householdName"
        label="Nome da família"
        required
        defaultValue={DEFAULTS.householdName}
        error={fieldErrors.householdName}
        disabled={pending}
      />
      <FormField
        id="babyName"
        name="babyName"
        label="Nome do bebê"
        required
        defaultValue={DEFAULTS.babyName}
        error={fieldErrors.babyName}
        disabled={pending}
      />
      <FormField
        id="dueDate"
        name="dueDate"
        type="date"
        label="Data prevista do parto"
        defaultValue={DEFAULTS.dueDate}
        error={fieldErrors.dueDate}
        disabled={pending}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="birthType"
          name="birthType"
          label="Tipo de parto previsto"
          defaultValue={DEFAULTS.birthType}
          error={fieldErrors.birthType}
          disabled={pending}
        />
        <FormField
          id="maternity"
          name="maternity"
          label="Maternidade"
          defaultValue={DEFAULTS.maternity}
          error={fieldErrors.maternity}
          disabled={pending}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="city"
          name="city"
          label="Cidade"
          defaultValue={DEFAULTS.city}
          error={fieldErrors.city}
          disabled={pending}
        />
        <FormField
          id="state"
          name="state"
          label="Estado"
          defaultValue={DEFAULTS.state}
          error={fieldErrors.state}
          disabled={pending}
        />
      </div>
      {state.status === "error" && !state.fieldErrors ? (
        <p
          role="alert"
          className="rounded-md bg-danger-soft p-3 text-sm text-danger-strong"
        >
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Criando o Ninho…" : "Criar o Ninho"}
      </Button>
    </form>
  );
}
