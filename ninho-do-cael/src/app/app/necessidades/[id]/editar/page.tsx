import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getSessionInfo } from "@/lib/auth/session";
import { editarNecessidade } from "@/lib/needs/actions";
import { buildNeedViewModel } from "@/lib/needs/view-model";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getNeedById } from "@/server/repositories/needs-repository";

import { NeedForm } from "../../need-form";

export const metadata: Metadata = { title: "Editar necessidade" };

export default async function EditarNecessidadePage({
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
    redirect("/app/necessidades");
  }

  const supabase = await createSupabaseServerClient();
  const row = await getNeedById(supabase, id);
  if (!row) {
    notFound();
  }
  const need = buildNeedViewModel(row, new Date().toISOString().slice(0, 10));
  const action = editarNecessidade.bind(null, id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href={`/app/necessidades/${id}`}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          {need.title}
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest-900">
          Editar necessidade
        </h1>
      </div>
      <NeedForm action={action} need={need} submitLabel="Salvar alterações" />
    </div>
  );
}
