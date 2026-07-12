"use client";

import { PlusIcon, StarIcon } from "@phosphor-icons/react/dist/ssr";
import * as React from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { FormField } from "@/components/form-field";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { idleState, type ActionState } from "@/lib/auth/action-state";
import { salvarProduto } from "@/lib/commerce/actions";
import { formatBRL } from "@/lib/formatters/currency";
import type { ProductStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

export type ProductRow = {
  id: string;
  name: string;
  family: string | null;
  brand: string | null;
  model: string | null;
  variant: string | null;
  color: string | null;
  size_label: string | null;
  status: ProductStatus;
  store: string | null;
  url: string | null;
  reference_price: number | null;
  paid_price: number | null;
  compatibility: string | null;
  reason: string | null;
  need_products: Array<{
    need_id: string;
    is_preferred: boolean;
    needs: { title: string } | null;
  }>;
};

type NeedOption = { id: string; title: string };

export function ProductsView({
  products,
  needs,
}: {
  products: ProductRow[];
  needs: NeedOption[];
}) {
  const [editing, setEditing] = React.useState<ProductRow | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [compareIds, setCompareIds] = React.useState<string[]>([]);

  const compared = products.filter((product) =>
    compareIds.includes(product.id),
  );

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id);
      }
      if (current.length >= 4) {
        toast("O comparador aceita até 4 produtos.");
        return current;
      }
      return [...current, id];
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            Produtos
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Alternativas em avaliação e escolhas feitas. Selecione até 4 para
            comparar.
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setCreating(true)}>
          <PlusIcon size={18} aria-hidden="true" />
          Novo produto
        </Button>
      </header>

      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Cadastre alternativas para comparar marcas, preços e compatibilidade."
          action={
            <Button onClick={() => setCreating(true)}>Cadastrar produto</Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const link = product.need_products[0];
            const comparing = compareIds.includes(product.id);
            return (
              <li
                key={product.id}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-[0_1px_2px_rgba(41,53,44,0.05)]",
                  comparing ? "border-moss-700" : "border-sand/70",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 font-semibold text-forest-900">
                    {product.name}
                  </p>
                  <StatusBadge
                    domain="produto"
                    value={product.status}
                    size="sm"
                  />
                </div>
                <p className="text-sm text-text-secondary">
                  {[
                    product.brand,
                    product.model,
                    product.color,
                    product.size_label,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Sem detalhes"}
                </p>
                <p className="text-sm text-forest-900">
                  {product.reference_price !== null
                    ? `Referência ${formatBRL(Number(product.reference_price))}`
                    : "Sem preço de referência"}
                  {product.paid_price !== null
                    ? ` · pago ${formatBRL(Number(product.paid_price))}`
                    : ""}
                </p>
                {link ? (
                  <p className="flex items-center gap-1 text-sm text-moss-700">
                    {link.is_preferred ? (
                      <StarIcon size={14} weight="fill" aria-hidden="true" />
                    ) : null}
                    {link.needs?.title ?? "Necessidade vinculada"}
                    {link.is_preferred ? " (preferido)" : ""}
                  </p>
                ) : null}
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  {product.url ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-olive-600 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {product.store ?? "Ver na loja"}
                    </a>
                  ) : (
                    <span className="text-sm text-text-secondary">
                      {product.store ?? ""}
                    </span>
                  )}
                  <span className="ml-auto flex gap-1">
                    <Button
                      variant={comparing ? "secondary" : "ghost"}
                      size="sm"
                      aria-pressed={comparing}
                      onClick={() => toggleCompare(product.id)}
                    >
                      {comparing ? "Comparando" : "Comparar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(product)}
                    >
                      Editar
                    </Button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {compared.length >= 2 ? (
        <section
          aria-label="Comparador de produtos"
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[36rem] border-collapse rounded-lg border border-sand bg-card text-sm">
            <caption className="p-3 text-left font-display text-lg font-semibold text-forest-900">
              Comparando {compared.length} produtos
            </caption>
            <thead>
              <tr className="border-b border-sand text-left">
                <th scope="col" className="p-3 font-medium text-text-secondary">
                  Campo
                </th>
                {compared.map((product) => (
                  <th
                    scope="col"
                    key={product.id}
                    className="p-3 text-forest-900"
                  >
                    {product.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Marca", (p: ProductRow) => p.brand],
                  ["Modelo", (p: ProductRow) => p.model],
                  [
                    "Preço",
                    (p: ProductRow) =>
                      p.reference_price !== null
                        ? formatBRL(Number(p.reference_price))
                        : null,
                  ],
                  ["Compatibilidade", (p: ProductRow) => p.compatibility],
                  ["Status", (p: ProductRow) => p.status],
                  ["Motivo", (p: ProductRow) => p.reason],
                ] as Array<[string, (p: ProductRow) => string | null]>
              ).map(([label, getter]) => (
                <tr key={label} className="border-b border-sand/60 align-top">
                  <th
                    scope="row"
                    className="p-3 font-medium text-text-secondary"
                  >
                    {label}
                  </th>
                  {compared.map((product) => (
                    <td key={product.id} className="p-3 text-forest-900">
                      {getter(product) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <ProductDialog
        open={creating}
        onOpenChange={setCreating}
        needs={needs}
        product={null}
      />
      <ProductDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        needs={needs}
        product={editing}
      />
    </div>
  );
}

function ProductDialog({
  open,
  onOpenChange,
  needs,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  needs: NeedOption[];
  product: ProductRow | null;
}) {
  const action = salvarProduto.bind(null, product?.id ?? null);
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(action, idleState);
  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const link = product?.need_products[0];

  React.useEffect(() => {
    if (state.status !== "success") return;
    toast(state.message ?? "Produto salvo.");
    const timer = setTimeout(() => onOpenChange(false), 0);
    return () => clearTimeout(timer);
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar produto" : "Novo produto"}
          </DialogTitle>
          <DialogDescription>
            Marca, preço e compatibilidade ajudam na comparação.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <FormField
            id="name"
            name="name"
            label="Nome"
            required
            defaultValue={product?.name}
            error={fieldErrors.name}
            disabled={pending}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              id="brand"
              name="brand"
              label="Marca"
              defaultValue={product?.brand ?? undefined}
              disabled={pending}
            />
            <FormField
              id="model"
              name="model"
              label="Modelo"
              defaultValue={product?.model ?? undefined}
              disabled={pending}
            />
            <FormField
              id="store"
              name="store"
              label="Loja"
              defaultValue={product?.store ?? undefined}
              disabled={pending}
            />
            <FormField
              id="url"
              name="url"
              label="Link"
              placeholder="https://…"
              defaultValue={product?.url ?? undefined}
              error={fieldErrors.url}
              disabled={pending}
            />
            <FormField
              id="reference_price"
              name="reference_price"
              type="number"
              label="Preço de referência (R$)"
              defaultValue={product?.reference_price?.toString()}
              error={fieldErrors.reference_price}
              disabled={pending}
            />
            <FormField
              id="paid_price"
              name="paid_price"
              type="number"
              label="Preço pago (R$)"
              defaultValue={product?.paid_price?.toString()}
              error={fieldErrors.paid_price}
              disabled={pending}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                name="status"
                defaultValue={product?.status ?? "candidato"}
                disabled={pending}
              >
                <option value="candidato">Candidato</option>
                <option value="escolhido">Escolhido</option>
                <option value="descartado">Descartado</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="need_id">Necessidade</Label>
              <Select
                id="need_id"
                name="need_id"
                defaultValue={link?.need_id ?? ""}
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
          </div>
          <FormField
            id="compatibility"
            name="compatibility"
            label="Compatibilidade"
            defaultValue={product?.compatibility ?? undefined}
            disabled={pending}
          />
          <FormField
            id="reason"
            name="reason"
            label="Motivo / observações"
            defaultValue={product?.reason ?? undefined}
            disabled={pending}
          />
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-forest-900">
            <input
              type="checkbox"
              name="is_preferred"
              defaultChecked={link?.is_preferred ?? false}
              disabled={pending}
              className="size-4 accent-olive-600"
            />
            Produto preferido para a necessidade
          </label>
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
              {pending ? "Salvando…" : "Salvar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
