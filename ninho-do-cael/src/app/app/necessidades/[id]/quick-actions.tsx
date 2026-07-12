"use client";

import {
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  PackageIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr";
import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { idleState, type ActionState } from "@/lib/auth/action-state";
import {
  arquivarNecessidade,
  atualizarQuantidade,
  confirmarEntrega,
  marcarComprada,
  marcarPronta,
  restaurarNecessidade,
} from "@/lib/needs/actions";
import type {
  AcquisitionStatus,
  LogisticsStatus,
  ReadinessStatus,
} from "@/types/domain";

type QuickActionsProps = {
  needId: string;
  acquisitionStatus: AcquisitionStatus;
  logisticsStatus: LogisticsStatus;
  readinessStatus: ReadinessStatus;
  requiredQuantity: number | null;
  availableQuantity: number | null;
  archived: boolean;
};

/** Ações rápidas da necessidade (SDD, seção 16) — cada uma persiste de verdade. */
export function NeedQuickActions(props: QuickActionsProps) {
  const [pending, startTransition] = React.useTransition();

  function run(action: () => Promise<ActionState>) {
    startTransition(async () => {
      const result = await action();
      if (result.status === "success") {
        toast(result.message ?? "Feito.");
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  const canMarkBought =
    !props.archived &&
    props.acquisitionStatus !== "comprado" &&
    props.acquisitionStatus !== "ja_possui" &&
    props.acquisitionStatus !== "nao_comprar";
  const canConfirmDelivery =
    !props.archived &&
    props.logisticsStatus !== "entregue" &&
    props.logisticsStatus !== "nao_aplicavel";
  const canMarkReady =
    !props.archived &&
    props.readinessStatus !== "pronto_para_uso" &&
    props.readinessStatus !== "nao_aplicavel";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações rápidas</CardTitle>
        <CardDescription>
          Atualizações de um toque — tudo fica no histórico.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {canMarkBought ? (
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => run(() => marcarComprada(props.needId))}
              className="gap-1.5"
            >
              <CheckCircleIcon size={18} aria-hidden="true" />
              Marcar comprada
            </Button>
          ) : null}
          {canConfirmDelivery ? (
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => run(() => confirmarEntrega(props.needId))}
              className="gap-1.5"
            >
              <PackageIcon size={18} aria-hidden="true" />
              Confirmar entrega
            </Button>
          ) : null}
          {canMarkReady ? (
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => run(() => marcarPronta(props.needId))}
              className="gap-1.5"
            >
              <SparkleIcon size={18} aria-hidden="true" />
              Marcar pronta
            </Button>
          ) : null}
          {props.archived ? (
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => run(() => restaurarNecessidade(props.needId))}
              className="gap-1.5"
            >
              <ArrowCounterClockwiseIcon size={18} aria-hidden="true" />
              Restaurar
            </Button>
          ) : (
            <ConfirmDialog
              trigger={
                <Button
                  variant="outline"
                  disabled={pending}
                  className="gap-1.5"
                >
                  <ArchiveIcon size={18} aria-hidden="true" />
                  Arquivar
                </Button>
              }
              title="Arquivar esta necessidade?"
              description="Ela sai das listas, mas continua no histórico e pode ser restaurada."
              confirmLabel="Arquivar"
              onConfirm={async () => {
                const result = await arquivarNecessidade(props.needId);
                if (result.status === "success") {
                  toast(result.message ?? "Arquivada.");
                } else if (result.status === "error") {
                  toast.error(result.message);
                }
              }}
            />
          )}
        </div>

        {props.requiredQuantity ? (
          <QuantityForm
            needId={props.needId}
            requiredQuantity={props.requiredQuantity}
            availableQuantity={props.availableQuantity}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function QuantityForm({
  needId,
  requiredQuantity,
  availableQuantity,
}: {
  needId: string;
  requiredQuantity: number;
  availableQuantity: number | null;
}) {
  const boundAction = atualizarQuantidade.bind(null, needId);
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(boundAction, idleState);

  React.useEffect(() => {
    if (state.status === "success") {
      toast(state.message ?? "Quantidade atualizada.");
    }
  }, [state]);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="w-40">
        <FormField
          id="available_quantity"
          name="available_quantity"
          type="number"
          label={`Quantidade (de ${requiredQuantity})`}
          defaultValue={availableQuantity?.toString() ?? "0"}
          error={
            state.status === "error"
              ? state.fieldErrors?.available_quantity
              : undefined
          }
          disabled={pending}
        />
      </div>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  );
}
