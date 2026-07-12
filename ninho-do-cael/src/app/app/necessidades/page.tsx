import { ListChecksIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getSessionInfo } from "@/lib/auth/session";
import { parseNeedFilters } from "@/lib/needs/filters";
import { buildNeedViewModel } from "@/lib/needs/view-model";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listNeeds } from "@/server/repositories/needs-repository";

import { NeedsExplorer } from "./needs-explorer";

export const metadata: Metadata = { title: "Necessidades" };

export default async function NecessidadesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Necessidades
        </h1>
        <EmptyState
          icon={ListChecksIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), esta tela lista as necessidades do enxoval com busca, filtros combináveis e ações rápidas."
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const rows = await listNeeds(supabase);
  const today = new Date().toISOString().slice(0, 10);
  const needs = rows.map((row) => buildNeedViewModel(row, today));
  const initialFilters = parseNeedFilters(params);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            Necessidades
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            O que o Cael precisa, do desejo à prontidão.
          </p>
        </div>
        <Link
          href="/app/necessidades/nova"
          className={buttonVariants({
            className: "hidden gap-1.5 lg:inline-flex",
          })}
        >
          <PlusIcon size={18} aria-hidden="true" />
          Nova necessidade
        </Link>
      </header>

      <NeedsExplorer needs={needs} initialFilters={initialFilters} />

      {/* FAB contextual no mobile (SDD, seção 11.3) */}
      <Link
        href="/app/necessidades/nova"
        aria-label="Nova necessidade"
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
