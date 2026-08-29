"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatBRL } from "@/lib/formatters/currency";

/**
 * Gráficos do painel e do orçamento (SDD, seções 15.6, 23 e 31): Recharts
 * com as cores dos design tokens e sempre acompanhados de resumo textual —
 * o gráfico ilustra, o texto garante a informação.
 */

const TICK = { fill: "var(--text-secondary)", fontSize: 12 } as const;
const TOOLTIP_STYLE = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--sand)",
  borderRadius: 12,
  fontSize: 13,
  color: "var(--forest-900)",
} as const;

export type BarKind = "percent" | "currency" | "count";

function formatValue(kind: BarKind, value: number): string {
  if (kind === "percent") return `${value}%`;
  if (kind === "currency") return formatBRL(value);
  return String(value);
}

export function HorizontalBars({
  data,
  kind,
  ariaLabel,
}: {
  data: Array<{ label: string; value: number }>;
  kind: BarKind;
  ariaLabel: string;
}) {
  const height = data.length * 44 + 16;
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 56, bottom: 4, left: 0 }}
        >
          <XAxis
            type="number"
            hide
            domain={kind === "percent" ? [0, 100] : [0, "auto"]}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={118}
            tickLine={false}
            axisLine={false}
            tick={TICK}
          />
          <Tooltip
            cursor={{ fill: "var(--sage-100)", opacity: 0.4 }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [formatValue(kind, Number(value)), null]}
          />
          <Bar
            dataKey="value"
            fill="var(--moss-700)"
            radius={[0, 6, 6, 0]}
            barSize={20}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value: unknown) => formatValue(kind, Number(value))}
              fill="var(--forest-900)"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StackedPhaseBars({
  data,
  ariaLabel,
}: {
  data: Array<{ label: string; prontas: number; pendentes: number }>;
  ariaLabel: string;
}) {
  const height = data.length * 44 + 48;
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 32, bottom: 4, left: 0 }}
        >
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={118}
            tickLine={false}
            axisLine={false}
            tick={TICK}
          />
          <Tooltip
            cursor={{ fill: "var(--sage-100)", opacity: 0.4 }}
            contentStyle={TOOLTIP_STYLE}
          />
          <Legend
            formatter={(value: string) => (
              <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                {value}
              </span>
            )}
          />
          <Bar
            dataKey="prontas"
            name="Prontas"
            stackId="fase"
            fill="var(--moss-700)"
            barSize={20}
            isAnimationActive={false}
          />
          <Bar
            dataKey="pendentes"
            name="Pendentes"
            stackId="fase"
            fill="var(--sand)"
            radius={[0, 6, 6, 0]}
            barSize={20}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EvolutionArea({
  data,
  ariaLabel,
}: {
  data: Array<{ label: string; valor: number }>;
  ariaLabel: string;
}) {
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: 8 }}
        >
          <CartesianGrid
            stroke="var(--sand)"
            strokeOpacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={TICK}
            minTickGap={24}
          />
          <YAxis
            width={72}
            tickLine={false}
            axisLine={false}
            tick={TICK}
            tickFormatter={(value: number) => formatBRL(value)}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [formatBRL(Number(value)), "Acumulado"]}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="var(--moss-700)"
            strokeWidth={2}
            fill="var(--sage-100)"
            fillOpacity={0.8}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
