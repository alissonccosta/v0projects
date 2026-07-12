"use client";

import { CopyIcon } from "@phosphor-icons/react/dist/ssr";
import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { idleState, type ActionState } from "@/lib/auth/action-state";
import { createInvite, revokeInvite } from "@/lib/auth/actions";

type Invite = {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
};

function inviteStatus(invite: Invite): {
  label: string;
  tone: "success" | "neutral" | "outline" | "danger";
} {
  if (invite.accepted_at) return { label: "Aceito", tone: "success" };
  if (invite.revoked_at) return { label: "Revogado", tone: "outline" };
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { label: "Expirado", tone: "danger" };
  }
  return { label: "Pendente", tone: "neutral" };
}

async function copyInviteLink(token: string) {
  const link = `${window.location.origin}/convite/${token}`;
  await navigator.clipboard.writeText(link);
  toast("Link copiado", { description: link });
}

export function InviteSection({ invites }: { invites: Invite[] }) {
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(createInvite, idleState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convites</CardTitle>
        <CardDescription>
          Convide alguém pelo e-mail e compartilhe o link gerado. O convite vale
          por 14 dias e só pode ser usado uma vez.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <form
          action={formAction}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <FormField
              id="invite-email"
              name="email"
              type="email"
              label="E-mail de quem será convidado"
              required
              placeholder="duda@exemplo.com"
              error={
                state.status === "error" ? state.fieldErrors?.email : undefined
              }
              disabled={pending}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Criando…" : "Criar convite"}
          </Button>
        </form>

        {state.status === "error" && !state.fieldErrors ? (
          <p
            role="alert"
            className="rounded-md bg-danger-soft p-3 text-sm text-danger-strong"
          >
            {state.message}
          </p>
        ) : null}

        {state.status === "success" && state.data?.link ? (
          <div
            className="flex flex-col gap-2 rounded-md bg-sage-100 p-4"
            role="status"
          >
            <p className="text-sm font-semibold text-moss-700">
              {state.message}
            </p>
            <p className="text-sm break-all text-moss-700">{state.data.link}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-fit gap-1.5"
              onClick={() => {
                void navigator.clipboard
                  .writeText(state.data!.link!)
                  .then(() => toast("Link copiado"));
              }}
            >
              <CopyIcon size={16} aria-hidden="true" />
              Copiar link
            </Button>
          </div>
        ) : null}

        {invites.length > 0 ? (
          <ul className="flex flex-col divide-y divide-sand/60">
            {invites.map((invite) => {
              const status = inviteStatus(invite);
              const isPending = status.label === "Pendente";
              return (
                <li
                  key={invite.id}
                  className="flex flex-wrap items-center gap-2 py-3"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-forest-900">
                    {invite.email}
                  </span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                  {isPending ? (
                    <span className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => void copyInviteLink(invite.token)}
                      >
                        <CopyIcon size={16} aria-hidden="true" />
                        Copiar link
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button type="button" variant="ghost" size="sm">
                            Revogar
                          </Button>
                        }
                        title="Revogar este convite?"
                        description={`O link enviado para ${invite.email} deixará de funcionar.`}
                        confirmLabel="Revogar convite"
                        destructive
                        onConfirm={async () => {
                          await revokeInvite(invite.id);
                          toast("Convite revogado");
                        }}
                      />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">
            Nenhum convite criado ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
