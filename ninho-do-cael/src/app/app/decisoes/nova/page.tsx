import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSessionInfo } from "@/lib/auth/session";
import { criarDecisao } from "@/lib/decisions/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listNeeds } from "@/server/repositories/needs-repository";

import { DecisionForm } from "../decision-form";

export const metadata: Metadata = { title: "Nova decisão" };

export default async function NovaDecisaoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSessionInfo();
  if (session.mode !== "member") {
    redirect("/app/decisoes");
  }

  const params = await searchParams;
  const rawNeed = Array.isArray(params.necessidade)
    ? params.necessidade[0]
    : params.necessidade;
  const preselectedNeedIds =
    rawNeed && z.uuid().safeParse(rawNeed).success ? [rawNeed] : [];

  const supabase = await createSupabaseServerClient();
  const needs = await listNeeds(supabase);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/app/decisoes"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Decisões
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest-900">
          Nova decisão
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Registre a pergunta, quem decide e até quando.
        </p>
      </div>
      <DecisionForm
        action={criarDecisao}
        needOptions={needs
          .filter((need) => need.archived_at === null)
          .map((need) => ({ id: need.id, title: need.title }))}
        preselectedNeedIds={preselectedNeedIds}
        submitLabel="Registrar decisão"
      />
    </div>
  );
}
