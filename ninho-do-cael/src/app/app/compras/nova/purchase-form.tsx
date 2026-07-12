"use client";

import { PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import * as React from "react";

import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { idleState, type ActionState } from "@/lib/auth/action-state";
import { purchaseTotal } from "@/lib/calculations/financial";
import { criarCompra } from "@/lib/commerce/actions";
import { formatBRL } from "@/lib/formatters/currency";
import { PAYMENT_LABELS, PURCHASE_TYPE_LABELS } from "@/lib/labels";
import { PAYMENT_METHODS, PURCHASE_TYPES } from "@/types/domain";

type ItemRow = {
  key: number;
  description: string;
  quantity: string;
  unit_price: string;
  need_id: string;
};

export function PurchaseForm({
  needs,
}: {
  needs: Array<{ id: string; title: string }>;
}) {
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(criarCompra, idleState);
  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const [items, setItems] = React.useState<ItemRow[]>([
    { key: 1, description: "", quantity: "1", unit_price: "", need_id: "" },
  ]);
  const [discount, setDiscount] = React.useState("0");
  const [shipping, setShipping] = React.useState("0");

  const subtotal = items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0,
  );
  const total = purchaseTotal(
    subtotal,
    Number(discount) || 0,
    Number(shipping) || 0,
  );

  function updateItem(key: number, patch: Partial<ItemRow>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  const itemsPayload = JSON.stringify(
    items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      need_id: item.need_id || undefined,
    })),
  );

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="items" value={itemsPayload} />
      <input type="hidden" name="subtotal" value={subtotal.toFixed(2)} />

      <FormField
        id="title"
        name="title"
        label="Título"
        required
        placeholder="Ex.: Enxoval de roupas RN"
        error={fieldErrors.title}
        disabled={pending}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Tipo</Label>
          <Select
            id="type"
            name="type"
            defaultValue="online"
            disabled={pending}
          >
            {PURCHASE_TYPES.map((type) => (
              <option key={type} value={type}>
                {PURCHASE_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="payment_method">Pagamento</Label>
          <Select
            id="payment_method"
            name="payment_method"
            defaultValue=""
            disabled={pending}
          >
            <option value="">Não informado</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {PAYMENT_LABELS[method]}
              </option>
            ))}
          </Select>
        </div>
        <FormField
          id="supplier"
          name="supplier"
          label="Fornecedor"
          error={fieldErrors.supplier}
          disabled={pending}
        />
        <FormField
          id="order_reference"
          name="order_reference"
          label="Nº do pedido"
          error={fieldErrors.order_reference}
          disabled={pending}
        />
        <FormField
          id="purchased_at"
          name="purchased_at"
          type="date"
          label="Data da compra"
          error={fieldErrors.purchased_at}
          disabled={pending}
        />
        <FormField
          id="expected_delivery_at"
          name="expected_delivery_at"
          type="date"
          label="Entrega prevista"
          error={fieldErrors.expected_delivery_at}
          disabled={pending}
        />
      </div>

      <fieldset className="flex flex-col gap-3 rounded-lg border border-sand/70 bg-surface p-4">
        <legend className="px-1 text-sm font-semibold text-forest-900">
          Itens da compra
        </legend>
        {items.map((item, index) => (
          <div
            key={item.key}
            className="grid gap-2 rounded-md bg-canvas/60 p-3 sm:grid-cols-[1fr_5rem_7rem_1fr_auto] sm:items-end"
          >
            <div className="flex flex-col gap-1">
              <Label htmlFor={`item-desc-${item.key}`} className="text-xs">
                Descrição
              </Label>
              <Input
                id={`item-desc-${item.key}`}
                value={item.description}
                onChange={(event) =>
                  updateItem(item.key, { description: event.target.value })
                }
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`item-qty-${item.key}`} className="text-xs">
                Qtd.
              </Label>
              <Input
                id={`item-qty-${item.key}`}
                type="number"
                min="0"
                value={item.quantity}
                onChange={(event) =>
                  updateItem(item.key, { quantity: event.target.value })
                }
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`item-price-${item.key}`} className="text-xs">
                Valor unit. (R$)
              </Label>
              <Input
                id={`item-price-${item.key}`}
                type="number"
                min="0"
                step="0.01"
                value={item.unit_price}
                onChange={(event) =>
                  updateItem(item.key, { unit_price: event.target.value })
                }
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`item-need-${item.key}`} className="text-xs">
                Necessidade
              </Label>
              <Select
                id={`item-need-${item.key}`}
                value={item.need_id}
                onChange={(event) =>
                  updateItem(item.key, { need_id: event.target.value })
                }
                disabled={pending}
              >
                <option value="">Sem vínculo</option>
                {needs.map((need) => (
                  <option key={need.id} value={need.id}>
                    {need.title}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remover item ${index + 1}`}
              disabled={pending || items.length === 1}
              onClick={() =>
                setItems((current) =>
                  current.filter((row) => row.key !== item.key),
                )
              }
            >
              <TrashIcon size={18} aria-hidden="true" />
            </Button>
          </div>
        ))}
        {fieldErrors.items ? (
          <p role="alert" className="text-sm text-danger-strong">
            {fieldErrors.items}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-1"
          disabled={pending}
          onClick={() =>
            setItems((current) => [
              ...current,
              {
                key: Math.max(...current.map((row) => row.key)) + 1,
                description: "",
                quantity: "1",
                unit_price: "",
                need_id: "",
              },
            ])
          }
        >
          <PlusIcon size={16} aria-hidden="true" />
          Adicionar item
        </Button>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="discount">Desconto (R$)</Label>
          <Input
            id="discount"
            name="discount"
            type="number"
            min="0"
            step="0.01"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="shipping">Frete (R$)</Label>
          <Input
            id="shipping"
            name="shipping"
            type="number"
            min="0"
            step="0.01"
            value={shipping}
            onChange={(event) => setShipping(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col justify-end gap-1 rounded-md bg-sage-100 px-4 py-2">
          <p className="text-xs text-moss-700">
            Subtotal {formatBRL(subtotal)} − desconto + frete
          </p>
          <p className="font-display text-xl font-semibold text-moss-700">
            Total {formatBRL(total)}
          </p>
        </div>
      </div>

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
          {pending ? "Registrando…" : "Registrar compra"}
        </Button>
      </div>
    </form>
  );
}
