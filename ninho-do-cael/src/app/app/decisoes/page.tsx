import {
  PlusIcon,
  ScalesIcon,
  StethoscopeIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getSessionInfo } from "@/lib/auth/session";
import { MEDICAL_DECISION_NOTICE, groupDecisions } from "@/lib/decisions/model";
import { buildDecisionItem } from "@/lib/decisions/view-model";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listDecisions } from "@/server/repositories/decisions-repository";

import { DecisionCard } from "./decision-card";

export const metadata: Metadata = { title: "Decisões" };

export default async function DecisoesPage() {
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Decisões
        </h1>
        <EmptyState
          icon={ScalesIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), esta tela separa o que exige ação, o que aguarda profissional e o que já foi decidido."
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const rows = await listDecisions(supabase);
  const decisions = rows.map(buildDecisionItem);
  const groups = groupDecisions(decisions);
  const hasMedical = decisions.some((decision) => decision.type === "medica");

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            Decisões
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Escolhas familiares, técnicas, médicas, de segurança e financeiras.
          </p>
        </div>
        <Link
          href="/app/decisoes/nova"
          className={buttonVariants({
            className: "hidden gap-1.5 lg:inline-flex",
          })}
        >
          <PlusIcon size={18} aria-hidden="true" />
          Nova decisão
        </Link>
      </header>

      {hasMedical ? (
        <p className="flex items-start gap-2.5 rounded-md bg-info-soft p-3 text-sm leading-relaxed text-forest-900">
          <StethoscopeIcon
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-moss-700"
          />
          {MEDICAL_DECISION_NOTICE}
        </p>
      ) : null}

      {decisions.length === 0 ? (
        <EmptyState
          icon={ScalesIcon}
          title="Nenhuma decisão registrada"
          description="Registre a primeira pergunta em aberto — do tipo de carrinho ao pediatra do Cael."
          action={
            <Link href="/app/decisoes/nova" className={buttonVariants()}>
              Registrar decisão
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-7">
          {groups
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <section key={group.key} className="flex flex-col gap-2">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-text-secondary uppercase">
                    {group.label} · {group.items.length}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {group.description}
                  </p>
                </div>
                <ul className="flex flex-col gap-2">
                  {group.items.map((decision) => (
                    <li key={decision.id}>
                      <DecisionCard decision={decision} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}

      <Link
        href="/app/decisoes/nova"
        aria-label="Nova decisão"
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
