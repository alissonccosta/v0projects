import { TagIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { getSessionInfo } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { ProductsView, type ProductRow } from "./products-view";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProdutosPage() {
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Produtos
        </h1>
        <EmptyState
          icon={TagIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), esta tela reúne produtos e alternativas, com comparador e vínculo às necessidades."
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: products }, { data: needs }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, family, brand, model, variant, color, size_label, status, store, url, reference_price, paid_price, compatibility, reason, need_products(need_id, is_preferred, needs(title))",
      )
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("needs")
      .select("id, title")
      .is("archived_at", null)
      .order("title", { ascending: true }),
  ]);

  return (
    <ProductsView
      products={(products ?? []) as unknown as ProductRow[]}
      needs={needs ?? []}
    />
  );
}
