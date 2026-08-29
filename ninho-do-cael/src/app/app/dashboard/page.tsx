import {
  ArrowRightIcon,
  BabyIcon,
  ChartBarIcon,
  ClockCounterClockwiseIcon,
  CompassIcon,
  FireIcon,
  HandCoinsIcon,
  HouseIcon,
  PiggyBankIcon,
  PlusIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

import { ChartCard } from "@/components/charts/chart-card";
import { HorizontalBars, StackedPhaseBars } from "@/components/charts/charts";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionInfo } from "@/lib/auth/session";
import { formatBRL } from "@/lib/formatters/currency";
import { formatDateBR } from "@/lib/formatters/date";
import { PHASE_LABELS, RESPONSIBLE_LABELS } from "@/lib/labels";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  loadDashboardData,
  type DashboardData,
} from "@/server/services/dashboard-service";
import type { NextAction } from "@/lib/dashboard/model";

export const metadata: Metadata = { title: "Início" };

const REASON_LABELS: Record<NextAction["reasonKey"], string> = {
  vencido: "Vencido",
  critico: "Crítico",
  prazo: "Prazo perto",
  bloqueador: "Bloqueador",
  prioridade: "Prioridade alta",
  restante: "Pendente",
};

const REASON_TONES: Record<
  NextAction["reasonKey"],
  "danger" | "warning" | "info" | "neutral"
> = {
  vencido: "danger",
  critico: "danger",
  prazo: "warning",
  bloqueador: "warning",
  prioridade: "info",
  restante: "neutral",
};

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

export default async function DashboardPage() {
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Início
        </h1>
        <EmptyState
          icon={HouseIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), o painel mostra prontidão, contagem regressiva, financeiro, próximas ações e alertas — tudo calculado dos dados reais."
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const data = await loadDashboardData(supabase, today);
  const overallPercent = Math.round(data.readiness.overall * 100);
  const beforeBirthPercent = Math.round(data.readiness.beforeBirth * 100);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            Início
          </h1>
          <p className="mt-1 text-sm text-text-secondary first-letter:uppercase">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>
        <Link
          href="/app/necessidades/nova"
          className={buttonVariants({ className: "gap-1.5" })}
        >
          <PlusIcon size={18} aria-hidden="true" />
          Nova necessidade
        </Link>
      </header>

      {data.countdown ? (
        <Card className="border-sage-300 bg-sage-100/40">
          <CardContent className="flex flex-wrap items-baseline gap-x-6 gap-y-2 p-5">
            <p className="font-display text-2xl font-semibold text-forest-900">
              {data.countdown.daysRemaining >= 0
                ? `${data.countdown.daysRemaining} dias até a data prevista`
                : `${data.baby?.name ?? "Cael"} já chegou`}
            </p>
            <p className="text-sm text-moss-700">
              {formatDateBR(data.countdown.birthDate)} ·{" "}
              {PHASE_LABELS[data.countdown.phase]}
              {data.countdown.nextMilestone
                ? ` · ${data.countdown.nextMilestone}`
                : ""}
            </p>
            <p className="w-full text-xs text-text-secondary">
              Data prevista é referência de planejamento — quem manda é o Cael e
              a equipe médica.
            </p>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={BabyIcon}
          title="Sem data prevista cadastrada"
          description="O painel calcula a contagem regressiva a partir da data definida no onboarding."
        />
      )}

      <section
        aria-label="Prontidão e financeiro"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="Prontidão geral"
          value={`${overallPercent}%`}
          context={
            data.readiness.totalActive > 0
              ? `${data.readiness.totalActive} necessidades ativas, ponderadas por criticidade`
              : "Nenhuma necessidade cadastrada ainda"
          }
          icon={CompassIcon}
          emphasis
        />
        <MetricCard
          title="Antes do parto"
          value={`${beforeBirthPercent}%`}
          context="Fases “antes do parto” e “contínuo”"
          icon={ShieldCheckIcon}
        />
        <MetricCard
          title="Críticos pendentes"
          value={String(data.readiness.criticalPending)}
          context={
            data.readiness.criticalPending === 0
              ? "Nenhum item crítico em aberto"
              : "Itens críticos ainda não prontos"
          }
          icon={FireIcon}
          action={
            data.readiness.criticalPending > 0 ? (
              <Link
                href="/app/necessidades?somenteCriticas=1&somentePendencias=1"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-moss-700 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ver pendências
                <ArrowRightIcon size={14} aria-hidden="true" />
              </Link>
            ) : undefined
          }
        />
        <MetricCard
          title="Aguardando entrega"
          value={String(data.financial.awaitingDelivery)}
          context={
            data.financial.awaitingDelivery === 0
              ? "Nenhum pedido a caminho"
              : "Pedidos confirmados ainda não entregues"
          }
          icon={TruckIcon}
        />
        <MetricCard
          title="Pago"
          value={formatBRL(data.financial.paid)}
          context="Compras comprometidas, líquidas de devolução"
          icon={HandCoinsIcon}
        />
        <MetricCard
          title="Pendente estimado"
          value={formatBRL(data.financial.pendingEstimate)}
          context={`Até o parto: ${formatBRL(data.financial.pendingEstimateUntilBirth)}`}
          icon={ChartBarIcon}
        />
        <MetricCard
          title="Economia registrada"
          value={formatBRL(data.financial.savings)}
          context="Descontos obtidos nas compras"
          icon={PiggyBankIcon}
          action={
            <Link
              href="/app/orcamento"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-moss-700 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver orçamento completo
              <ArrowRightIcon size={14} aria-hidden="true" />
            </Link>
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximas ações</CardTitle>
          </CardHeader>
          <CardContent>
            {data.nextActions.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Nada urgente agora. Quando algo vencer, travar ou virar
                prioridade, aparece aqui.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.nextActions.map((action) => (
                  <li key={`${action.kind}:${action.id}`}>
                    <Link
                      href={action.href}
                      className="flex flex-col gap-1 rounded-md p-2 -m-2 outline-none hover:bg-canvas focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge tone={REASON_TONES[action.reasonKey]}>
                          {REASON_LABELS[action.reasonKey]}
                        </Badge>
                        <span className="font-medium text-forest-900">
                          {action.title}
                        </span>
                      </span>
                      <span className="text-xs text-text-secondary">
                        {[
                          action.reason,
                          RESPONSIBLE_LABELS[action.responsible],
                          action.dueDate && action.reasonKey !== "vencido"
                            ? `até ${formatDateBR(action.dueDate)}`
                            : null,
                          action.dependency
                            ? `depende de ${action.dependency}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            {data.alerts.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Nenhum alerta agora — decisões médicas, entregas, bloqueios e
                divergências de custo aparecem aqui quando existirem.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.alerts.map((alert) => (
                  <li key={alert.key}>
                    <Link
                      href={alert.href}
                      className={`flex flex-col gap-0.5 rounded-md border p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        alert.severity === "danger"
                          ? "border-danger/25 bg-danger-soft/60 hover:border-danger/50"
                          : "border-warning/25 bg-warning-soft/60 hover:border-warning/50"
                      }`}
                    >
                      <span
                        className={`text-sm font-semibold ${
                          alert.severity === "danger"
                            ? "text-danger-strong"
                            : "text-warning-strong"
                        }`}
                      >
                        {alert.title}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {alert.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <ChartsSection data={data} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <ClockCounterClockwiseIcon
                size={20}
                aria-hidden="true"
                className="text-moss-700"
              />
              Atividade recente
            </span>
            <Link
              href="/app/atividade"
              className="text-sm font-medium text-moss-700 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver tudo
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityList data={data} compact />
        </CardContent>
      </Card>
    </div>
  );
}

function ChartsSection({ data }: { data: DashboardData }) {
  const { charts } = data;
  const hasAny =
    charts.readinessByCategory.length > 0 ||
    charts.spendByCategory.length > 0 ||
    charts.purchasesByStatus.length > 0 ||
    charts.scheduleByPhase.length > 0;
  if (!hasAny) {
    return null;
  }

  const readinessSorted = [...charts.readinessByCategory].sort(
    (a, b) => b.percent - a.percent,
  );
  const readinessSummary =
    readinessSorted.length > 0
      ? `Maior prontidão: ${readinessSorted[0]!.label} (${readinessSorted[0]!.percent}%); menor: ${readinessSorted.at(-1)!.label} (${readinessSorted.at(-1)!.percent}%).`
      : "";

  const spendTotal = charts.spendByCategory.reduce(
    (sum, datum) => sum + datum.amount,
    0,
  );
  const spendSummary =
    charts.spendByCategory.length > 0
      ? `Total: ${formatBRL(Math.round(spendTotal * 100) / 100)}. Maior gasto: ${charts.spendByCategory[0]!.label} (${formatBRL(charts.spendByCategory[0]!.amount)}).`
      : "";

  const statusSummary = charts.purchasesByStatus
    .map((datum) => `${datum.count} ${datum.label.toLocaleLowerCase("pt-BR")}`)
    .join(", ");

  const scheduleSummary = charts.scheduleByPhase
    .map((datum) => `${datum.label}: ${datum.ready}/${datum.total} prontas`)
    .join("; ");

  return (
    <section aria-label="Gráficos" className="grid gap-6 lg:grid-cols-2">
      {charts.readinessByCategory.length > 0 ? (
        <ChartCard title="Prontidão por categoria" summary={readinessSummary}>
          <HorizontalBars
            data={charts.readinessByCategory.map((datum) => ({
              label: datum.label,
              value: datum.percent,
            }))}
            kind="percent"
            ariaLabel="Gráfico de barras da prontidão por categoria"
          />
        </ChartCard>
      ) : null}
      {charts.spendByCategory.length > 0 ? (
        <ChartCard title="Gastos por categoria" summary={spendSummary}>
          <HorizontalBars
            data={charts.spendByCategory.map((datum) => ({
              label: datum.label,
              value: datum.amount,
            }))}
            kind="currency"
            ariaLabel="Gráfico de barras dos gastos por categoria"
          />
        </ChartCard>
      ) : null}
      {charts.purchasesByStatus.length > 0 ? (
        <ChartCard title="Compras por status" summary={`${statusSummary}.`}>
          <HorizontalBars
            data={charts.purchasesByStatus.map((datum) => ({
              label: datum.label,
              value: datum.count,
            }))}
            kind="count"
            ariaLabel="Gráfico de barras das compras por status"
          />
        </ChartCard>
      ) : null}
      {charts.scheduleByPhase.length > 0 ? (
        <ChartCard title="Cronograma por fase" summary={`${scheduleSummary}.`}>
          <StackedPhaseBars
            data={charts.scheduleByPhase.map((datum) => ({
              label: datum.label,
              prontas: datum.ready,
              pendentes: datum.total - datum.ready,
            }))}
            ariaLabel="Gráfico de barras das necessidades prontas e pendentes por fase"
          />
        </ChartCard>
      ) : null}
    </section>
  );
}

function ActivityList({
  data,
  compact = false,
}: {
  data: DashboardData;
  compact?: boolean;
}) {
  if (data.activity.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        Nenhuma alteração registrada ainda.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {data.activity.slice(0, compact ? 6 : undefined).map((entry) => (
        <li key={entry.id} className="text-sm">
          <p className="text-forest-900">
            <span className="font-semibold">
              {entry.actor?.display_name ?? "Sistema"}
            </span>{" "}
            {ACTIVITY_LABELS[entry.action] ?? entry.action}{" "}
            {ENTITY_LABELS[entry.entity_type] ?? entry.entity_type}{" "}
            {entry.target_href ? (
              <Link
                href={entry.target_href}
                className="font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                {entry.target_title ?? ""}
              </Link>
            ) : (
              <span className="font-medium">{entry.target_title ?? ""}</span>
            )}
            {entry.origin !== "app" ? ` (via ${entry.origin})` : ""}
          </p>
          <p className="text-xs text-text-secondary">
            {new Date(entry.created_at).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}
