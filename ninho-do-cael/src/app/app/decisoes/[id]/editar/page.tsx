import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getSessionInfo } from "@/lib/auth/session";
import { editarDecisao } from "@/lib/decisions/actions";
import { buildDecisionItem } from "@/lib/decisions/view-model";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDecisionById } from "@/server/repositories/decisions-repository";
import { listNeeds } from "@/server/repositories/needs-repository";

import { DecisionForm } from "../../decision-form";

export const metadata: Metadata = { title: "Editar decisão" };

export default async function EditarDecisaoPage({
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
    redirect("/app/decisoes");
  }

  const supabase = await createSupabaseServerClient();
  const row = await getDecisionById(supabase, id);
  if (!row) {
    notFound();
  }
  const decision = buildDecisionItem(row);
  const needs = await listNeeds(supabase);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href={`/app/decisoes/${decision.id}`}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          {decision.title}
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest-900">
          Editar decisão
        </h1>
      </div>
      <DecisionForm
        action={editarDecisao.bind(null, decision.id)}
        decision={decision}
        needOptions={needs
          .filter((need) => need.archived_at === null)
          .map((need) => ({ id: need.id, title: need.title }))}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
