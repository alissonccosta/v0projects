import {
  BabyIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  PathIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionInfo } from "@/lib/auth/session";
import { formatBRL } from "@/lib/formatters/currency";
import { formatDateBR } from "@/lib/formatters/date";
import {
  buildJourney,
  phaseForLinked,
  type PhaseSummary,
} from "@/lib/journey/model";
import { PHASE_LABELS } from "@/lib/labels";
import { buildNeedViewModel } from "@/lib/needs/view-model";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listNeeds } from "@/server/repositories/needs-repository";
import type { DecisionStatus, TaskStatus, UsagePhase } from "@/types/domain";

export const metadata: Metadata = { title: "Jornada" };

export default async function JornadaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Jornada
        </h1>
        <EmptyState
          icon={PathIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), esta tela mostra cada fase do Cael com prontidão, gasto e marcos."
        />
      </div>
    );
  }

  const params = await searchParams;
  const rawFuturos = Array.isArray(params.futuros)
    ? params.futuros[0]
    : params.futuros;
  const showFuture = rawFuturos === "1";

  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: baby }, needRows, tasksResult, decisionsResult, purchases] =
    await Promise.all([
      supabase.from("babies").select("name, due_date").limit(1).maybeSingle(),
      listNeeds(supabase),
      supabase
        .from("tasks")
        .select("status, due_date, need_tasks(need:needs(phase))")
        .is("archived_at", null),
      supabase
        .from("decisions")
        .select("status, due_date, need_decisions(need:needs(phase))")
        .is("archived_at", null),
      supabase
        .from("purchases")
        .select(
          "status, total, returned_amount, purchase_items(total, need:needs(phase))",
        )
        .is("archived_at", null),
    ]);

  if (!baby?.due_date) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Jornada
        </h1>
        <EmptyState
          icon={BabyIcon}
          title="Sem data prevista cadastrada"
          description="A jornada é calculada a partir da data prevista do parto, definida no onboarding."
        />
      </div>
    );
  }
  const birthDate = baby.due_date as string;

  const needs = needRows.map((row) => {
    const view = buildNeedViewModel(row, today);
    return {
      phase: view.phase,
      criticality: view.criticality,
      readiness: view.readiness,
      archived: view.archivedAt !== null,
    };
  });

  const tasks = (
    (tasksResult.data ?? []) as unknown as Array<{
      status: string;
      due_date: string | null;
      need_tasks: Array<{ need: { phase: string } }>;
    }>
  ).map((row) => ({
    phase: phaseForLinked(
      row.need_tasks.map((link) => link.need.phase as UsagePhase),
      row.due_date,
      birthDate,
    ),
    status: row.status as TaskStatus,
    dueDate: row.due_date,
  }));

  const decisions = (
    (decisionsResult.data ?? []) as unknown as Array<{
      status: string;
      due_date: string | null;
      need_decisions: Array<{ need: { phase: string } }>;
    }>
  ).map((row) => ({
    phase: phaseForLinked(
      row.need_decisions.map((link) => link.need.phase as UsagePhase),
      row.due_date,
      birthDate,
    ),
    status: row.status as DecisionStatus,
  }));

  const journeyPurchases = (
    (purchases.data ?? []) as unknown as Array<{
      status: string;
      total: number;
      returned_amount: number;
      purchase_items: Array<{
        total: number;
        need: { phase: string } | null;
      }>;
    }>
  ).map((row) => ({
    status: row.status,
    total: Number(row.total),
    returnedAmount: Number(row.returned_amount),
    items: row.purchase_items.map((item) => ({
      allocatedTotal: Number(item.total),
      phase: item.need ? (item.need.phase as UsagePhase) : null,
    })),
  }));

  const journey = buildJourney({
    needs,
    tasks,
    decisions,
    purchases: journeyPurchases,
    birthDate,
    today,
  });

  const futureCount = journey.phases.filter((phase) => phase.future).length;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            Jornada
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            As fases do {baby.name ?? "Cael"}, da espera ao primeiro ano — data
            prevista: {formatDateBR(birthDate)}.
          </p>
        </div>
        {futureCount > 0 ? (
          <Link
            href={showFuture ? "/app/jornada" : "/app/jornada?futuros=1"}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-sand bg-surface px-4 text-sm font-medium text-text-secondary outline-none hover:border-sage-300 hover:text-forest-900 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showFuture ? (
              <>
                <EyeSlashIcon size={16} aria-hidden="true" />
                Ocultar itens futuros
              </>
            ) : (
              <>
                <EyeIcon size={16} aria-hidden="true" />
                Mostrar itens futuros
              </>
            )}
          </Link>
        ) : null}
      </header>

      <div className="flex flex-col gap-4">
        {journey.phases.map((phase) => (
          <PhaseCard
            key={phase.phase}
            summary={phase}
            expanded={!phase.future || showFuture}
          />
        ))}
      </div>

      {journey.unassignedSpent > 0 ? (
        <p className="text-sm text-text-secondary">
          {formatBRL(journey.unassignedSpent)} em itens de compra sem
          necessidade vinculada não entram em nenhuma fase.
        </p>
      ) : null}
    </div>
  );
}

function windowLabel(summary: PhaseSummary): string {
  const { start, end } = summary.window;
  if (start && end) return `${formatDateBR(start)} — ${formatDateBR(end)}`;
  if (!start && end) return `até ${formatDateBR(end)}`;
  if (start && !end) return `a partir de ${formatDateBR(start)}`;
  return "sem janela fixa";
}

function PhaseCard({
  summary,
  expanded,
}: {
  summary: PhaseSummary;
  expanded: boolean;
}) {
  const readinessPercent = Math.round(summary.needs.readiness * 100);
  const isEmpty =
    summary.needs.total === 0 &&
    summary.tasks.total === 0 &&
    summary.decisions.total === 0 &&
    summary.purchases.count === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {PHASE_LABELS[summary.phase]}
          {summary.future ? <Badge tone="neutral">Fase futura</Badge> : null}
          {!summary.future && summary.needs.total > 0 ? (
            <span className="ml-auto font-display text-xl text-moss-700">
              {readinessPercent}%
            </span>
          ) : null}
        </CardTitle>
        <p className="text-sm text-text-secondary">
          {windowLabel(summary)} · {summary.milestone}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isEmpty ? (
          <p className="text-sm text-text-secondary">
            Nada planejado para esta fase ainda.
          </p>
        ) : !expanded ? (
          <p className="text-sm text-text-secondary">
            {[
              summary.needs.total > 0
                ? `${summary.needs.total} ${summary.needs.total === 1 ? "necessidade" : "necessidades"}`
                : null,
              summary.tasks.total > 0
                ? `${summary.tasks.total} ${summary.tasks.total === 1 ? "tarefa" : "tarefas"}`
                : null,
              summary.decisions.total > 0
                ? `${summary.decisions.total} ${summary.decisions.total === 1 ? "decisão" : "decisões"}`
                : null,
              summary.purchases.spent > 0
                ? `${formatBRL(summary.purchases.spent)} gastos`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
            {
              " — fora da urgência atual. Use “Mostrar itens futuros” para o detalhe."
            }
          </p>
        ) : (
          <>
            {summary.needs.total > 0 ? (
              <div
                role="img"
                aria-label={`Prontidão da fase: ${readinessPercent}%`}
                className="h-2 overflow-hidden rounded-full bg-sage-100"
              >
                <div
                  className="h-full rounded-full bg-moss-700"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
            ) : null}
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-text-secondary">Necessidades</dt>
                <dd className="font-medium text-forest-900">
                  {summary.needs.total === 0
                    ? "Nenhuma"
                    : `${summary.needs.ready}/${summary.needs.total} prontas`}
                </dd>
                {summary.needs.total > 0 ? (
                  <Link
                    href={`/app/necessidades?fase=${summary.phase}`}
                    className="mt-0.5 inline-flex min-h-11 items-center text-sm font-medium text-moss-700 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Ver da fase
                  </Link>
                ) : null}
              </div>
              <div>
                <dt className="text-text-secondary">Tarefas</dt>
                <dd className="font-medium text-forest-900">
                  {summary.tasks.total === 0 ? (
                    "Nenhuma"
                  ) : (
                    <>
                      {summary.tasks.done}/{summary.tasks.total} concluídas
                      {summary.tasks.blocked > 0
                        ? ` · ${summary.tasks.blocked} bloqueada${summary.tasks.blocked > 1 ? "s" : ""}`
                        : ""}
                      {summary.tasks.overdue > 0 ? (
                        <span className="text-danger-strong">
                          {" "}
                          · {summary.tasks.overdue} vencida
                          {summary.tasks.overdue > 1 ? "s" : ""}
                        </span>
                      ) : null}
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">Decisões</dt>
                <dd className="font-medium text-forest-900">
                  {summary.decisions.total === 0 ? (
                    "Nenhuma"
                  ) : (
                    <>
                      {summary.decisions.decided}/{summary.decisions.total}{" "}
                      decididas
                      {summary.decisions.awaitingProfessional > 0
                        ? ` · ${summary.decisions.awaitingProfessional} com profissional`
                        : ""}
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">Gasto</dt>
                <dd className="font-medium text-forest-900">
                  {summary.purchases.spent > 0 ? (
                    <>
                      {formatBRL(summary.purchases.spent)}
                      <span className="text-text-secondary">
                        {" "}
                        · {summary.purchases.count}{" "}
                        {summary.purchases.count === 1 ? "compra" : "compras"}
                      </span>
                    </>
                  ) : (
                    "Nada gasto"
                  )}
                </dd>
              </div>
            </dl>
            {summary.needs.total > 0 &&
            summary.needs.ready === summary.needs.total ? (
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-success-strong">
                <CheckCircleIcon size={16} aria-hidden="true" />
                Tudo pronto por aqui.
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
