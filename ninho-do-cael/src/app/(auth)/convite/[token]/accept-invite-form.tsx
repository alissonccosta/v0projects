"use client";

import * as React from "react";

import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { idleState, type ActionState } from "@/lib/auth/action-state";
import { acceptInvite } from "@/lib/auth/actions";

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(acceptInvite, idleState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormField
        id="displayName"
        name="displayName"
        label="Seu nome"
        required
        autoComplete="name"
        error={
          state.status === "error" ? state.fieldErrors?.displayName : undefined
        }
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
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Aceitar convite"}
      </Button>
    </form>
  );
}
