import {
  BasketIcon,
  CalendarHeartIcon,
  PiggyBankIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status/status-badge";
import {
  STATUS_CONFIG,
  type StatusDomain,
} from "@/components/status/status-config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { ConfirmDemo } from "./confirm-demo";

export const metadata: Metadata = { title: "Design system" };

const PALETTE: { name: string; variable: string }[] = [
  { name: "canvas", variable: "--canvas" },
  { name: "surface", variable: "--surface" },
  { name: "surface-muted", variable: "--surface-muted" },
  { name: "sand", variable: "--sand" },
  { name: "rattan", variable: "--rattan" },
  { name: "wood", variable: "--wood" },
  { name: "sage-100", variable: "--sage-100" },
  { name: "sage-300", variable: "--sage-300" },
  { name: "sage-500", variable: "--sage-500" },
  { name: "olive-600", variable: "--olive-600" },
  { name: "moss-700", variable: "--moss-700" },
  { name: "forest-900", variable: "--forest-900" },
  { name: "success", variable: "--success" },
  { name: "warning", variable: "--warning" },
  { name: "danger", variable: "--danger" },
  { name: "info", variable: "--info" },
];

const DOMAIN_TITLES: Record<StatusDomain, string> = {
  decisaoNecessidade: "Decisão da necessidade (9.5)",
  aquisicao: "Aquisição (9.6)",
  logistica: "Logística (9.7)",
  prontidao: "Prontidão (9.8)",
  tarefa: "Tarefas (9.9)",
  decisao: "Decisões (9.10)",
  criticidade: "Criticidade (9.3)",
  prioridade: "Prioridade (9.4)",
  sincronizacao: "Sincronização (7.6)",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl font-semibold text-forest-900">
      {children}
    </h2>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Design system
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
          Referência interna dos tokens e componentes do Ninho do Cael (SDD,
          seções 12 e 14). Os valores exibidos nos exemplos são ilustrativos e
          estão identificados como exemplo — os módulos reais sempre calculam a
          partir do banco.
        </p>
      </header>

      <section aria-labelledby="ds-cores" className="flex flex-col gap-3">
        <SectionTitle>Paleta</SectionTitle>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PALETTE.map((color) => (
            <li key={color.name} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-10 shrink-0 rounded-md border border-sand"
                style={{ background: `var(${color.variable})` }}
              />
              <span className="text-sm text-text-secondary">{color.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <SectionTitle>Tipografia</SectionTitle>
        <Card>
          <CardContent className="flex flex-col gap-3 pt-5 sm:pt-6">
            <p className="font-display text-3xl font-semibold text-forest-900">
              Fraunces para títulos e números
            </p>
            <p className="text-base">
              Manrope para a interface, com fallback em system-ui. Corpo de
              texto confortável para leitura no celular.
            </p>
            <p className="text-sm text-text-secondary">
              Texto secundário para contexto e detalhes.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <SectionTitle>Botões</SectionTitle>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Ação principal</Button>
          <Button variant="secondary">Secundária</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="ghost">Discreta</Button>
          <Button variant="destructive">Destrutiva</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Desabilitado (demonstração)</Button>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <SectionTitle>Status — mapeamento centralizado</SectionTitle>
        {(Object.keys(STATUS_CONFIG) as StatusDomain[]).map((domain) => (
          <div key={domain} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-text-secondary">
              {DOMAIN_TITLES[domain]}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(
                Object.keys(STATUS_CONFIG[domain]) as Array<
                  keyof (typeof STATUS_CONFIG)[typeof domain] & string
                >
              ).map((value) => (
                <StatusBadge key={value} domain={domain} value={value} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <SectionTitle>MetricCard (valores de exemplo)</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Prontidão geral (exemplo)"
            value="62"
            unit="%"
            context="Exemplo ilustrativo — o cálculo real chega na Fase 6."
            icon={CalendarHeartIcon}
            emphasis
          />
          <MetricCard
            title="Valor pago (exemplo)"
            value="R$ 12.082"
            context="Exemplo ilustrativo do formato monetário."
            icon={PiggyBankIcon}
          />
          <MetricCard
            title="Pedidos a caminho (exemplo)"
            value="3"
            context="Exemplo ilustrativo de contagem."
            icon={BasketIcon}
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <SectionTitle>Confirmações e feedback</SectionTitle>
        <ConfirmDemo />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <SectionTitle>Estados de tela</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyState
            title="Exemplo de estado vazio"
            description="Explica o vazio e, quando fizer sentido, oferece uma ação útil."
          />
          <Card>
            <CardHeader>
              <CardTitle>Carregando</CardTitle>
              <CardDescription>Skeleton com pulso suave.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24" />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
