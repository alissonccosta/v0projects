"use client";

import {
  ArrowCounterClockwiseIcon,
  PackageIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import * as React from "react";
import { toast } from "sonner";

import { FormField } from "@/components/form-field";
import { getStatusVisual } from "@/components/status/status-config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { idleState, type ActionState } from "@/lib/auth/action-state";
import {
  confirmarEntregaCompra,
  marcarEnviada,
  registrarDevolucao,
} from "@/lib/commerce/actions";
import { formatBRL } from "@/lib/formatters/currency";
import { READINESS_STATUSES, type PurchaseStatus } from "@/types/domain";

type ItemInfo = { id: string; description: string; quantity: number };

export function PurchaseActions({
  purchaseId,
  status,
  total,
  returnedAmount,
  items,
}: {
  purchaseId: string;
  status: PurchaseStatus;
  total: number;
  returnedAmount: number;
  items: ItemInfo[];
}) {
  const [pending, startTransition] = React.useTransition();

  const canSend = status === "confirmada" || status === "aguardando_envio";
  const canDeliver =
    status === "confirmada" ||
    status === "aguardando_envio" ||
    status === "enviada" ||
    status === "entregue_parcial";
  const canReturn =
    (status === "entregue" || status === "entregue_parcial") &&
    returnedAmount < total;

  if (!canSend && !canDeliver && !canReturn) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações</CardTitle>
        <CardDescription>
          Entregas criam estoque, atualizam necessidades e geram tarefas de
          preparo automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {canSend ? (
          <Button
            variant="secondary"
            className="gap-1.5"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await marcarEnviada(purchaseId);
                if (result.status === "success")
                  toast(result.message ?? "Feito.");
                else if (result.status === "error") toast.error(result.message);
              })
            }
          >
            <TruckIcon size={18} aria-hidden="true" />
            Marcar enviada
          </Button>
        ) : null}
        {canDeliver ? (
          <DeliveryDialog purchaseId={purchaseId} items={items} />
        ) : null}
        {canReturn ? (
          <ReturnDialog
            purchaseId={purchaseId}
            remaining={total - returnedAmount}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function DeliveryDialog({
  purchaseId,
  items,
}: {
  purchaseId: string;
  items: ItemInfo[];
}) {
  const [open, setOpen] = React.useState(false);
  const action = confirmarEntregaCompra.bind(null, purchaseId);
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(action, idleState);
  const [rows, setRows] = React.useState(() =>
    items.map((item) => ({
      item_id: item.id,
      delivered_quantity: String(item.quantity),
      readiness: "pronto_para_uso",
    })),
  );

  React.useEffect(() => {
    if (state.status !== "success") return;
    toast(state.message ?? "Entrega confirmada.");
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [state]);

  const payload = JSON.stringify(rows);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <PackageIcon size={18} aria-hidden="true" />
          Confirmar entrega
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar entrega</DialogTitle>
          <DialogDescription>
            Confira o que chegou, em que quantidade e o preparo necessário.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="items" value={payload} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="delivered_at"
              name="delivered_at"
              type="date"
              label="Data da entrega"
              defaultValue={new Date().toISOString().slice(0, 10)}
              disabled={pending}
            />
            <FormField
              id="location"
              name="location"
              label="Onde vai ficar"
              placeholder="Ex.: Cômoda do quarto"
              disabled={pending}
            />
          </div>
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-2 rounded-md bg-canvas/60 p-3 sm:grid-cols-[1fr_6rem_1fr] sm:items-end"
              >
                <p className="text-sm font-medium text-forest-900">
                  {item.description}
                </p>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`ent-qty-${item.id}`} className="text-xs">
                    Recebido (de {item.quantity})
                  </Label>
                  <input
                    id={`ent-qty-${item.id}`}
                    type="number"
                    min="0"
                    max={item.quantity}
                    className="h-11 rounded-md border border-input bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={rows[index]?.delivered_quantity ?? "0"}
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, delivered_quantity: event.target.value }
                            : row,
                        ),
                      )
                    }
                    disabled={pending}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`ent-ready-${item.id}`} className="text-xs">
                    Preparo necessário
                  </Label>
                  <Select
                    id={`ent-ready-${item.id}`}
                    value={rows[index]?.readiness ?? "pronto_para_uso"}
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, readiness: event.target.value }
                            : row,
                        ),
                      )
                    }
                    disabled={pending}
                  >
                    {READINESS_STATUSES.filter(
                      (value) =>
                        value !== "nao_aplicavel" && value !== "pendente",
                    ).map((value) => (
                      <option key={value} value={value}>
                        {getStatusVisual("prontidao", value).label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            ))}
          </div>
          {state.status === "error" ? (
            <p
              role="alert"
              className="rounded-md bg-danger-soft p-3 text-sm text-danger-strong"
            >
              {state.message}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Confirmando…" : "Confirmar entrega"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReturnDialog({
  purchaseId,
  remaining,
}: {
  purchaseId: string;
  remaining: number;
}) {
  const [open, setOpen] = React.useState(false);
  const action = registrarDevolucao.bind(null, purchaseId);
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(action, idleState);

  React.useEffect(() => {
    if (state.status !== "success") return;
    toast(state.message ?? "Devolução registrada.");
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <ArrowCounterClockwiseIcon size={18} aria-hidden="true" />
          Registrar devolução
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar devolução</DialogTitle>
          <DialogDescription>
            Restam {formatBRL(remaining)} pagos nesta compra.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kind">Tipo</Label>
            <Select
              id="kind"
              name="kind"
              defaultValue="parcial"
              disabled={pending}
            >
              <option value="parcial">Parcial</option>
              <option value="total">Total</option>
            </Select>
          </div>
          <FormField
            id="amount"
            name="amount"
            type="number"
            label="Valor devolvido (R$)"
            required
            error={
              state.status === "error" ? state.fieldErrors?.amount : undefined
            }
            disabled={pending}
          />
          <FormField
            id="reason"
            name="reason"
            label="Motivo"
            required
            error={
              state.status === "error" ? state.fieldErrors?.reason : undefined
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
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Registrando…" : "Registrar devolução"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
