import {
  ArrowCounterClockwiseIcon,
  HandCoinsIcon,
  PiggyBankIcon,
  TruckIcon,
  WalletIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { format, parseISO } from "date-fns";
import Link from "next/link";

import { ChartCard } from "@/components/charts/chart-card";
import { EvolutionArea, HorizontalBars } from "@/components/charts/charts";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { buttonVariants } from "@/components/ui/button";
import { getSessionInfo } from "@/lib/auth/session";
import { formatBRL } from "@/lib/formatters/currency";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadBudgetData } from "@/server/services/budget-service";

export const metadata: Metadata = { title: "Orçamento" };

export default async function OrcamentoPage() {
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Orçamento
        </h1>
        <EmptyState
          icon={WalletIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), esta tela consolida pago, comprometido, pendente, economia, frete e gastos por categoria, fase e fornecedor."
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const budget = await loadBudgetData(supabase);
  const { indicators } = budget;

  const isEmpty =
    budget.purchasesCount === 0 && indicators.pendingEstimate === 0;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Orçamento
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          A compra é a fonte financeira; necessidades entram como estimativa até
          terem compra. Frete e desconto ficam separados e kits não duplicam
          valores.
        </p>
      </header>

      {isEmpty ? (
        <EmptyState
          icon={WalletIcon}
          title="Nenhum valor registrado ainda"
          description="Registre compras (ou estimativas nas necessidades) para o orçamento ganhar vida."
          action={
            <Link href="/app/compras/nova" className={buttonVariants()}>
              Registrar compra
            </Link>
          }
        />
      ) : (
        <>
          <section
            aria-label="Indicadores"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <MetricCard
              title="Comprometido"
              value={formatBRL(indicators.committed)}
              context={`${budget.purchasesCount} ${budget.purchasesCount === 1 ? "compra ativa" : "compras ativas"}, líquido de devoluções`}
              icon={WalletIcon}
              emphasis
            />
            <MetricCard
              title="Pago (entregue)"
              value={formatBRL(indicators.paid)}
              context="Compras já entregues ou encerradas"
              icon={HandCoinsIcon}
            />
            <MetricCard
              title="A caminho"
              value={formatBRL(indicators.awaiting)}
              context="Confirmadas ou enviadas, ainda sem entrega"
              icon={TruckIcon}
            />
            <MetricCard
              title="Pendente estimado"
              value={formatBRL(indicators.pendingEstimate)}
              context={`Até o parto: ${formatBRL(indicators.pendingEstimateUntilBirth)}`}
              icon={WalletIcon}
            />
            <MetricCard
              title="Economia (descontos)"
              value={formatBRL(indicators.savings)}
              icon={PiggyBankIcon}
            />
            <MetricCard
              title="Frete total"
              value={formatBRL(indicators.shippingTotal)}
              context="Separado do valor dos itens"
              icon={TruckIcon}
            />
            <MetricCard
              title="Devolvido"
              value={formatBRL(indicators.returnedTotal)}
              context="Dinheiro que voltou em devoluções"
              icon={ArrowCounterClockwiseIcon}
            />
          </section>

          <section aria-label="Gráficos" className="grid gap-6 lg:grid-cols-2">
            {budget.byCategory.length > 0 ? (
              <ChartCard
                title="Gastos por categoria"
                summary={`Maior: ${budget.byCategory[0]!.label} (${formatBRL(budget.byCategory[0]!.amount)}).`}
              >
                <HorizontalBars
                  data={budget.byCategory.map((slice) => ({
                    label: slice.label,
                    value: slice.amount,
                  }))}
                  kind="currency"
                  ariaLabel="Gráfico de barras dos gastos por categoria"
                />
              </ChartCard>
            ) : null}

            {budget.evolution.length > 0 ? (
              <ChartCard
                title="Evolução acumulada"
                summary={`De ${formatBRL(budget.evolution[0]!.cumulative)} a ${formatBRL(budget.evolution.at(-1)!.cumulative)} em ${budget.evolution.length} ${budget.evolution.length === 1 ? "dia com compra" : "dias com compra"}.`}
              >
                <EvolutionArea
                  data={budget.evolution.map((point) => ({
                    label: format(parseISO(point.date), "dd/MM"),
                    valor: point.cumulative,
                  }))}
                  ariaLabel="Gráfico de área do comprometido acumulado ao longo do tempo"
                />
              </ChartCard>
            ) : null}

            <ChartCard
              title="Pago × pendente"
              summary={`Pago: ${formatBRL(budget.paidVsPending.paid)}; a caminho: ${formatBRL(budget.paidVsPending.awaiting)}; pendente estimado: ${formatBRL(budget.paidVsPending.pendingEstimate)}.`}
            >
              <HorizontalBars
                data={[
                  { label: "Pago", value: budget.paidVsPending.paid },
                  { label: "A caminho", value: budget.paidVsPending.awaiting },
                  {
                    label: "Pendente est.",
                    value: budget.paidVsPending.pendingEstimate,
                  },
                ]}
                kind="currency"
                ariaLabel="Gráfico de barras comparando pago, a caminho e pendente estimado"
              />
            </ChartCard>

            {budget.bySupplier.length > 0 ? (
              <ChartCard
                title="Fornecedores"
                summary={`${budget.bySupplier.length} ${budget.bySupplier.length === 1 ? "fornecedor" : "fornecedores"}; maior: ${budget.bySupplier[0]!.label} (${formatBRL(budget.bySupplier[0]!.amount)}).`}
              >
                <HorizontalBars
                  data={budget.bySupplier.map((slice) => ({
                    label: slice.label,
                    value: slice.amount,
                  }))}
                  kind="currency"
                  ariaLabel="Gráfico de barras dos gastos por fornecedor"
                />
              </ChartCard>
            ) : null}
          </section>

          {budget.byPhase.length > 0 ? (
            <ChartCard
              title="Gastos por fase"
              summary={budget.byPhase
                .map((slice) => `${slice.label}: ${formatBRL(slice.amount)}`)
                .join("; ")}
            >
              <HorizontalBars
                data={budget.byPhase.map((slice) => ({
                  label: slice.label,
                  value: slice.amount,
                }))}
                kind="currency"
                ariaLabel="Gráfico de barras dos gastos por fase"
              />
            </ChartCard>
          ) : null}
        </>
      )}
    </div>
  );
}
