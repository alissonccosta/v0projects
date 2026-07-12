import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionInfo } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { PurchaseForm } from "./purchase-form";

export const metadata: Metadata = { title: "Nova compra" };

export default async function NovaCompraPage() {
  const session = await getSessionInfo();
  if (session.mode !== "member") {
    redirect("/app/compras");
  }

  const supabase = await createSupabaseServerClient();
  const { data: needs } = await supabase
    .from("needs")
    .select("id, title")
    .is("archived_at", null)
    .order("title", { ascending: true });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/app/compras"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Compras
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest-900">
          Nova compra
        </h1>
      </div>
      <PurchaseForm needs={needs ?? []} />
    </div>
  );
}
