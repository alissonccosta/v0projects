"use client";

import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import * as React from "react";

import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { idleState, type ActionState } from "@/lib/auth/action-state";
import { sendMagicLink } from "@/lib/auth/actions";

export function LoginForm({
  next,
  externalError,
}: {
  next: string;
  externalError?: string;
}) {
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(sendMagicLink, idleState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-4" role="status">
        <div className="flex items-start gap-3 rounded-md bg-sage-100 p-4 text-moss-700">
          <EnvelopeSimpleIcon
            size={24}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <div>
            <p className="font-semibold">{state.message}</p>
            <p className="mt-1 text-sm">
              Abra o e-mail neste aparelho e toque no link para entrar. O link
              expira em alguns minutos.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.assign("/login")}
        >
          Usar outro e-mail
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormField
        id="email"
        name="email"
        type="email"
        label="E-mail"
        required
        autoComplete="email"
        placeholder="voce@exemplo.com"
        error={state.status === "error" ? state.fieldErrors?.email : undefined}
        disabled={pending}
      />
      {state.status === "error" && !state.fieldErrors ? (
        <p
          role="alert"
          className="rounded-md bg-danger-soft p-3 text-sm text-danger-strong"
        >
          {state.message}
        </p>
      ) : null}
      {externalError ? (
        <p
          role="alert"
          className="rounded-md bg-danger-soft p-3 text-sm text-danger-strong"
        >
          {externalError}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviar link de acesso"}
      </Button>
    </form>
  );
}
