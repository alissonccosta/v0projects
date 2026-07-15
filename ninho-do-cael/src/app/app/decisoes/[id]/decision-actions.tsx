"use client";

import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import * as React from "react";
import { toast } from "sonner";

import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { idleState, type ActionState } from "@/lib/auth/action-state";
import { decidirDecisao } from "@/lib/decisions/actions";
import { CONFIDENCE_LABELS } from "@/lib/labels";
import { DECISION_CONFIDENCES } from "@/types/domain";

/**
 * Fluxo Decidir (seções 21 e 10.11): conclusão obrigatória; decisão médica
 * ainda exige confirmar que a orientação veio de profissional.
 */
export function DecideDialog({
  decisionId,
  medical,
}: {
  decisionId: string;
  medical: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const action = decidirDecisao.bind(null, decisionId);
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(action, idleState);
  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  React.useEffect(() => {
    if (state.status !== "success") return;
    toast(state.message ?? "Decisão registrada.");
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <CheckCircleIcon size={18} aria-hidden="true" />
          Decidir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar a decisão</DialogTitle>
          <DialogDescription>
            {medical
              ? "Decisão médica: registre a conclusão orientada pelo profissional que acompanha vocês."
              : "Escreva a conclusão para fechar esta decisão com contexto."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="conclusion">Conclusão</Label>
            <Textarea
              id="conclusion"
              name="conclusion"
              placeholder="O que ficou decidido?"
              aria-invalid={fieldErrors.conclusion ? true : undefined}
              disabled={pending}
            />
            {fieldErrors.conclusion ? (
              <p role="alert" className="text-sm text-danger-strong">
                {fieldErrors.conclusion}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="decide-rationale">Justificativa (opcional)</Label>
            <Textarea
              id="decide-rationale"
              name="rationale"
              placeholder="Por que esse caminho?"
              disabled={pending}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="decide-source"
              name="source"
              label="Fonte"
              placeholder={medical ? "Ex.: obstetra na consulta" : "Opcional"}
              error={fieldErrors.source}
              disabled={pending}
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="decide-confidence">Confiança</Label>
              <Select
                id="decide-confidence"
                name="confidence"
                defaultValue=""
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
          </div>
          <FormField
            id="decided_at"
            name="decided_at"
            type="date"
            label="Decidida em"
            defaultValue={new Date().toISOString().slice(0, 10)}
            error={fieldErrors.decided_at}
            disabled={pending}
          />
          {medical ? (
            <>
              <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-sm text-forest-900">
                <input
                  type="checkbox"
                  name="medical_confirmed"
                  disabled={pending}
                  className="mt-0.5 size-4 accent-moss-700"
                />
                <span>
                  A conclusão veio de profissional que acompanha a gravidez ou o
                  Cael.
                </span>
              </label>
              {fieldErrors.medical_confirmed ? (
                <p role="alert" className="text-sm text-danger-strong">
                  {fieldErrors.medical_confirmed}
                </p>
              ) : null}
            </>
          ) : null}
          {state.status === "error" && !state.fieldErrors ? (
            <p
              role="alert"
              className="rounded-md bg-danger-soft p-3 text-sm text-danger-strong"
            >
              {state.message}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Registrando…" : "Registrar decisão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
