import { PlusIcon, ShoppingBagIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { getSessionInfo } from "@/lib/auth/session";
import { formatBRL } from "@/lib/formatters/currency";
import { formatDateBR } from "@/lib/formatters/date";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PurchaseStatus } from "@/types/domain";

export const metadata: Metadata = { title: "Compras" };

export default async function ComprasPage() {
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Compras
        </h1>
        <EmptyState
          icon={ShoppingBagIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), esta tela lista os pedidos com valores, entregas e devoluções."
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: purchases } = await supabase
    .from("purchases")
    .select(
      "id, title, status, supplier, purchased_at, expected_delivery_at, total, returned_amount, tracking_code, purchase_items(count)",
    )
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            Compras
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Pedidos, entregas e devoluções.
          </p>
        </div>
        <Link
          href="/app/compras/nova"
          className={buttonVariants({
            className: "hidden gap-1.5 lg:inline-flex",
          })}
        >
          <PlusIcon size={18} aria-hidden="true" />
          Nova compra
        </Link>
      </header>

      {(purchases ?? []).length === 0 ? (
        <EmptyState
          icon={ShoppingBagIcon}
          title="Nenhuma compra registrada"
          description="Registre a primeira compra do enxoval para acompanhar valores e entregas."
          action={
            <Link href="/app/compras/nova" className={buttonVariants()}>
              Registrar compra
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {(purchases ?? []).map((purchase) => {
            const itemCount =
              (
                purchase.purchase_items as unknown as Array<{ count: number }>
              )?.[0]?.count ?? 0;
            return (
              <li key={purchase.id}>
                <Link
                  href={`/app/compras/${purchase.id}`}
                  className="flex flex-col gap-2 rounded-lg border border-sand/70 bg-card p-4 shadow-[0_1px_2px_rgba(41,53,44,0.05)] transition-colors duration-150 outline-none hover:border-sage-300 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 font-semibold text-forest-900">
                      {purchase.title}
                    </p>
                    <span className="shrink-0 font-display text-sm font-semibold text-moss-700">
                      {formatBRL(Number(purchase.total))}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge
                      domain="compra"
                      value={purchase.status as PurchaseStatus}
                      size="sm"
                    />
                    {Number(purchase.returned_amount) > 0 ? (
                      <span className="text-xs font-medium text-danger-strong">
                        devolvido {formatBRL(Number(purchase.returned_amount))}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {[
                      purchase.supplier,
                      purchase.purchased_at
                        ? `compra ${formatDateBR(purchase.purchased_at)}`
                        : null,
                      purchase.expected_delivery_at
                        ? `previsão ${formatDateBR(purchase.expected_delivery_at)}`
                        : null,
                      purchase.tracking_code
                        ? `rastreio ${purchase.tracking_code}`
                        : null,
                      `${itemCount} ${itemCount === 1 ? "item" : "itens"}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/app/compras/nova"
        aria-label="Nova compra"
        className={buttonVariants({
          size: "icon",
          className:
            "fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 size-14 rounded-full shadow-[0_6px_20px_rgba(41,53,44,0.25)] lg:hidden",
        })}
      >
        <PlusIcon size={24} aria-hidden="true" />
      </Link>
    </div>
  );
}
