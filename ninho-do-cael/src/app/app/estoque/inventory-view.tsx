"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status/status-badge";
import { getStatusVisual } from "@/components/status/status-config";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { atualizarProntidaoItens } from "@/lib/commerce/actions";
import { formatDateBR } from "@/lib/formatters/date";
import { CATEGORY_LABELS, ITEM_ORIGIN_LABELS } from "@/lib/labels";
import {
  READINESS_STATUSES,
  type Category,
  type ItemCondition,
  type ItemOrigin,
  type ReadinessStatus,
} from "@/types/domain";
import { cn } from "@/lib/utils";

export type InventoryRow = {
  id: string;
  name: string;
  quantity: number;
  condition: ItemCondition;
  readiness_status: ReadinessStatus;
  location: string | null;
  origin: ItemOrigin;
  expires_at: string | null;
  need_id: string | null;
  needs: { title: string; category: Category } | null;
};

const GROUPINGS = {
  prontidao: "Por prontidão",
  local: "Por local",
  categoria: "Por categoria",
  validade: "Por validade",
} as const;
type Grouping = keyof typeof GROUPINGS;

export function InventoryView({ items }: { items: InventoryRow[] }) {
  const [grouping, setGrouping] = React.useState<Grouping>("prontidao");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [batchReadiness, setBatchReadiness] =
    React.useState<ReadinessStatus>("pronto_para_uso");
  const [pending, startTransition] = React.useTransition();

  const today = new Date().toISOString().slice(0, 10);

  function groupKey(item: InventoryRow): string {
    switch (grouping) {
      case "prontidao":
        return getStatusVisual("prontidao", item.readiness_status).label;
      case "local":
        return item.location ?? "Sem local definido";
      case "categoria":
        return item.needs
          ? CATEGORY_LABELS[item.needs.category]
          : "Sem categoria";
      case "validade":
        if (!item.expires_at) return "Sem validade";
        return item.expires_at < today ? "Vencidos" : "Com validade";
    }
  }

  const groups = new Map<string, InventoryRow[]>();
  for (const item of items) {
    const key = groupKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function applyBatch() {
    startTransition(async () => {
      const result = await atualizarProntidaoItens(selected, batchReadiness);
      if (result.status === "success") {
        toast(result.message ?? "Atualizado.");
        setSelected([]);
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            Estoque
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            O que já está em casa e o preparo de cada item.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="agrupamento" className="text-xs">
            Visualização
          </Label>
          <Select
            id="agrupamento"
            className="w-44"
            value={grouping}
            onChange={(event) => setGrouping(event.target.value as Grouping)}
          >
            {Object.entries(GROUPINGS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhum item em estoque"
          description="Os itens entram aqui automaticamente quando você confirma a entrega de uma compra."
        />
      ) : (
        <>
          {/* Lote de preparo (seção 19) */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-2 rounded-lg border p-3",
              selected.length > 0
                ? "border-moss-700 bg-sage-100/60"
                : "border-sand/70 bg-surface",
            )}
          >
            <span className="text-sm font-medium text-forest-900">
              {selected.length === 0
                ? "Selecione itens para preparar em lote"
                : `${selected.length} selecionado(s)`}
            </span>
            <Label htmlFor="lote-prontidao" className="sr-only">
              Nova prontidão
            </Label>
            <Select
              id="lote-prontidao"
              className="w-52"
              value={batchReadiness}
              onChange={(event) =>
                setBatchReadiness(event.target.value as ReadinessStatus)
              }
              disabled={pending}
            >
              {READINESS_STATUSES.filter(
                (value) => value !== "nao_aplicavel",
              ).map((value) => (
                <option key={value} value={value}>
                  {getStatusVisual("prontidao", value).label}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              disabled={pending || selected.length === 0}
              onClick={applyBatch}
            >
              {pending ? "Aplicando…" : "Aplicar"}
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            {[...groups.entries()].map(([label, groupItems]) => (
              <section key={label} className="flex flex-col gap-2">
                <h2 className="flex items-baseline gap-2 text-sm font-semibold text-moss-700">
                  {label}
                  <span className="font-normal text-text-secondary">
                    {groupItems.length}
                  </span>
                </h2>
                <ul className="flex flex-col gap-2">
                  {groupItems.map((item) => {
                    const expired =
                      item.expires_at !== null && item.expires_at < today;
                    return (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center gap-3 rounded-lg border border-sand/70 bg-card p-4 shadow-[0_1px_2px_rgba(41,53,44,0.05)]"
                      >
                        <label className="flex min-h-11 min-w-11 items-center justify-center">
                          <input
                            type="checkbox"
                            aria-label={`Selecionar ${item.name}`}
                            checked={selected.includes(item.id)}
                            onChange={() => toggle(item.id)}
                            className="size-5 accent-olive-600"
                          />
                        </label>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-forest-900">
                            {item.name}
                            <span className="ml-1 font-normal text-text-secondary">
                              × {Number(item.quantity)}
                            </span>
                          </p>
                          <p className="text-sm text-text-secondary">
                            {[
                              item.location,
                              ITEM_ORIGIN_LABELS[item.origin],
                              item.expires_at
                                ? `validade ${formatDateBR(item.expires_at)}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {item.need_id && item.needs ? (
                            <Link
                              href={`/app/necessidades/${item.need_id}`}
                              className="text-sm font-medium text-olive-600 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {item.needs.title}
                            </Link>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {expired ? (
                            <span className="rounded-full border border-danger/30 bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger-strong">
                              Vencido
                            </span>
                          ) : null}
                          <StatusBadge
                            domain="condicao"
                            value={item.condition}
                            size="sm"
                          />
                          <StatusBadge
                            domain="prontidao"
                            value={item.readiness_status}
                            size="sm"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
