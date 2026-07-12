import { PackageIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { getSessionInfo } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { InventoryView, type InventoryRow } from "./inventory-view";

export const metadata: Metadata = { title: "Estoque" };

export default async function EstoquePage() {
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Estoque
        </h1>
        <EmptyState
          icon={PackageIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), esta tela mostra o que já está em casa e o preparo de cada item."
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: items } = await supabase
    .from("inventory_items")
    .select(
      "id, name, quantity, condition, readiness_status, location, origin, expires_at, need_id, needs(title, category)",
    )
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  return <InventoryView items={(items ?? []) as unknown as InventoryRow[]} />;
}
