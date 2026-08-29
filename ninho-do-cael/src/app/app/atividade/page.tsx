import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionInfo } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listRecentActivity } from "@/server/repositories/activity-repository";

export const metadata: Metadata = { title: "Atividade" };

const ACTIVITY_LABELS: Record<string, string> = {
  criacao: "criou",
  atualizacao: "atualizou",
  arquivamento: "arquivou",
  restauracao: "restaurou",
  conclusao: "concluiu",
  sincronizacao: "sincronizou",
  importacao: "importou",
  exclusao: "excluiu",
};

const ENTITY_LABELS: Record<string, string> = {
  need: "a necessidade",
  task: "a tarefa",
  decision: "a decisão",
  purchase: "a compra",
  product: "o produto",
  inventory: "o item de estoque",
  household: "a família",
  invite: "o convite",
  profile: "o perfil",
};

export default async function AtividadePage() {
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Atividade
        </h1>
        <EmptyState
          icon={ClockCounterClockwiseIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), esta tela lista quem alterou o quê, com origem e horário (seção 26)."
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const activity = await listRecentActivity(supabase, 100);

  // Agrupa por dia para leitura mais confortável.
  const byDay = new Map<string, typeof activity>();
  for (const entry of activity) {
    const day = new Date(entry.created_at).toLocaleDateString("pt-BR", {
      dateStyle: "full",
    });
    const list = byDay.get(day) ?? [];
    list.push(entry);
    byDay.set(day, list);
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Atividade
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Tudo que mudou no Ninho: quem, o quê, origem e quando.
        </p>
      </header>

      {activity.length === 0 ? (
        <EmptyState
          icon={ClockCounterClockwiseIcon}
          title="Nenhuma alteração registrada"
          description="Criações, edições, conclusões e sincronizações aparecem aqui assim que acontecerem."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {[...byDay.entries()].map(([day, entries]) => (
            <section key={day} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-text-secondary uppercase first-letter:uppercase">
                {day}
              </h2>
              <Card>
                <CardContent className="p-4">
                  <ul className="flex flex-col gap-3">
                    {entries.map((entry) => (
                      <li key={entry.id} className="text-sm">
                        <p className="text-forest-900">
                          <span className="font-semibold">
                            {entry.actor?.display_name ?? "Sistema"}
                          </span>{" "}
                          {ACTIVITY_LABELS[entry.action] ?? entry.action}{" "}
                          {ENTITY_LABELS[entry.entity_type] ??
                            entry.entity_type}{" "}
                          {entry.target_href ? (
                            <Link
                              href={entry.target_href}
                              className="font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {entry.target_title ?? ""}
                            </Link>
                          ) : (
                            <span className="font-medium">
                              {entry.target_title ?? ""}
                            </span>
                          )}
                          <span className="text-text-secondary">
                            {" "}
                            ·{" "}
                            {entry.origin === "app"
                              ? "no app"
                              : `via ${entry.origin}`}
                          </span>
                        </p>
                        <p className="text-xs text-text-secondary">
                          {new Date(entry.created_at).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                          {entry.changes && entry.action === "atualizacao"
                            ? ` · ${Object.keys(entry.changes).length} campo(s)`
                            : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
