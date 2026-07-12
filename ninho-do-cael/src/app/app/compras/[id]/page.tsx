import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { StatusBadge } from "@/components/status/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionInfo } from "@/lib/auth/session";
import { formatBRL } from "@/lib/formatters/currency";
import { formatDateBR } from "@/lib/formatters/date";
import { PAYMENT_LABELS, PURCHASE_TYPE_LABELS } from "@/lib/labels";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  PaymentMethod,
  PurchaseStatus,
  PurchaseType,
} from "@/types/domain";

import { PurchaseActions } from "./purchase-actions";

export const metadata: Metadata = { title: "Compra" };

export default async function CompraDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }
  const session = await getSessionInfo();
  if (session.mode !== "member") {
    redirect("/app/compras");
  }

  const supabase = await createSupabaseServerClient();
  const { data: purchase } = await supabase
    .from("purchases")
    .select(
      "id, title, type, status, supplier, payment_method, order_reference, tracking_code, purchased_at, expected_delivery_at, delivered_at, subtotal, discount, shipping, total, returned_amount, return_reason, notes, purchase_items(id, description, quantity, unit_price, allocated_discount, allocated_shipping, total, need_id, needs(title))",
    )
    .eq("id", id)
    .maybeSingle();
  if (!purchase) {
    notFound();
  }

  const items = (purchase.purchase_items ?? []) as unknown as Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    allocated_discount: number;
    allocated_shipping: number;
    total: number;
    need_id: string | null;
    needs: { title: string } | null;
  }>;
  const status = purchase.status as PurchaseStatus;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/app/compras"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Compras
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            {purchase.title}
          </h1>
          <StatusBadge domain="compra" value={status} />
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          {[
            PURCHASE_TYPE_LABELS[purchase.type as PurchaseType],
            purchase.supplier,
            purchase.payment_method
              ? PAYMENT_LABELS[purchase.payment_method as PaymentMethod]
              : null,
            purchase.order_reference
              ? `pedido ${purchase.order_reference}`
              : null,
            purchase.tracking_code
              ? `rastreio ${purchase.tracking_code}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Valores</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-text-secondary">Subtotal</dt>
              <dd className="font-medium text-forest-900">
                {formatBRL(Number(purchase.subtotal))}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Desconto</dt>
              <dd className="font-medium text-success-strong">
                − {formatBRL(Number(purchase.discount))}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Frete</dt>
              <dd className="font-medium text-forest-900">
                {formatBRL(Number(purchase.shipping))}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Total</dt>
              <dd className="font-display text-lg font-semibold text-moss-700">
                {formatBRL(Number(purchase.total))}
              </dd>
            </div>
            {Number(purchase.returned_amount) > 0 ? (
              <div className="sm:col-span-2">
                <dt className="text-text-secondary">Devolvido</dt>
                <dd className="font-medium text-danger-strong">
                  {formatBRL(Number(purchase.returned_amount))}
                  {purchase.return_reason ? ` · ${purchase.return_reason}` : ""}
                </dd>
              </div>
            ) : null}
            {purchase.purchased_at ? (
              <div>
                <dt className="text-text-secondary">Data da compra</dt>
                <dd className="font-medium text-forest-900">
                  {formatDateBR(purchase.purchased_at)}
                </dd>
              </div>
            ) : null}
            {purchase.expected_delivery_at ? (
              <div>
                <dt className="text-text-secondary">Entrega prevista</dt>
                <dd className="font-medium text-forest-900">
                  {formatDateBR(purchase.expected_delivery_at)}
                </dd>
              </div>
            ) : null}
            {purchase.delivered_at ? (
              <div>
                <dt className="text-text-secondary">Entregue em</dt>
                <dd className="font-medium text-forest-900">
                  {formatDateBR(purchase.delivered_at)}
                </dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-sand/60">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-2 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-forest-900">
                    {item.description}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {Number(item.quantity)} ×{" "}
                    {formatBRL(Number(item.unit_price))}
                    {Number(item.allocated_discount) > 0
                      ? ` · desconto ${formatBRL(Number(item.allocated_discount))}`
                      : ""}
                    {Number(item.allocated_shipping) > 0
                      ? ` · frete ${formatBRL(Number(item.allocated_shipping))}`
                      : ""}
                    {item.needs?.title ? ` · ${item.needs.title}` : ""}
                  </p>
                </div>
                <span className="font-medium text-forest-900">
                  {formatBRL(Number(item.total))}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <PurchaseActions
        purchaseId={purchase.id}
        status={status}
        total={Number(purchase.total)}
        returnedAmount={Number(purchase.returned_amount)}
        items={items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
        }))}
      />

      {purchase.notes ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-text-secondary">
          {purchase.notes}
        </p>
      ) : null}
    </div>
  );
}
