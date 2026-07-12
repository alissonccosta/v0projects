import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionInfo } from "@/lib/auth/session";
import { criarNecessidade } from "@/lib/needs/actions";

import { NeedForm } from "../need-form";

export const metadata: Metadata = { title: "Nova necessidade" };

export default async function NovaNecessidadePage() {
  const session = await getSessionInfo();
  if (session.mode !== "member") {
    redirect("/app/necessidades");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/app/necessidades"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Necessidades
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-forest-900">
          Nova necessidade
        </h1>
      </div>
      <NeedForm action={criarNecessidade} submitLabel="Criar necessidade" />
    </div>
  );
}
