import {
  CheckSquareIcon,
  ClockCounterClockwiseIcon,
  GearSixIcon,
  HouseIcon,
  ListChecksIcon,
  PackageIcon,
  PathIcon,
  ScalesIcon,
  ShoppingBagIcon,
  TagIcon,
  WalletIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

export type ModuleKey =
  | "dashboard"
  | "necessidades"
  | "produtos"
  | "compras"
  | "estoque"
  | "tarefas"
  | "decisoes"
  | "jornada"
  | "orcamento"
  | "atividade"
  | "configuracoes";

export type NavItem = {
  key: ModuleKey;
  href: string;
  label: string;
  icon: Icon;
  /** O que o módulo fará quando implementado (usado nos placeholders). */
  description: string;
  /** Fase do SDD (seção 40) que implementa o módulo. */
  plannedPhase: string;
};

export const MODULES: Record<ModuleKey, NavItem> = {
  dashboard: {
    key: "dashboard",
    href: "/app/dashboard",
    label: "Início",
    icon: HouseIcon,
    description:
      "Visão geral: prontidão, contagem regressiva, financeiro, próximas ações e alertas.",
    plannedPhase: "Fase 6 — Dashboard e orçamento",
  },
  necessidades: {
    key: "necessidades",
    href: "/app/necessidades",
    label: "Necessidades",
    icon: ListChecksIcon,
    description:
      "As 131 necessidades do enxoval com filtros, busca, detalhe e ações rápidas.",
    plannedPhase: "Fase 3 — Necessidades",
  },
  produtos: {
    key: "produtos",
    href: "/app/produtos",
    label: "Produtos",
    icon: TagIcon,
    description:
      "Produtos e alternativas por necessidade, com comparador e preferido.",
    plannedPhase: "Fase 4 — Produtos, compras e estoque",
  },
  compras: {
    key: "compras",
    href: "/app/compras",
    label: "Compras",
    icon: ShoppingBagIcon,
    description:
      "Pedidos com valores, rastreio, confirmação de entrega e devoluções.",
    plannedPhase: "Fase 4 — Produtos, compras e estoque",
  },
  estoque: {
    key: "estoque",
    href: "/app/estoque",
    label: "Estoque",
    icon: PackageIcon,
    description:
      "O que já está em casa: quantidades, locais, condição e preparo para uso.",
    plannedPhase: "Fase 4 — Produtos, compras e estoque",
  },
  tarefas: {
    key: "tarefas",
    href: "/app/tarefas",
    label: "Tarefas",
    icon: CheckSquareIcon,
    description:
      "Tarefas, serviços e documentos com prazos, responsáveis e bloqueios.",
    plannedPhase: "Fase 5 — Tarefas, decisões e jornada",
  },
  decisoes: {
    key: "decisoes",
    href: "/app/decisoes",
    label: "Decisões",
    icon: ScalesIcon,
    description:
      "Decisões familiares, técnicas e médicas — com o que depende de cada pessoa.",
    plannedPhase: "Fase 5 — Tarefas, decisões e jornada",
  },
  jornada: {
    key: "jornada",
    href: "/app/jornada",
    label: "Jornada",
    icon: PathIcon,
    description:
      "As fases do Cael (antes do parto até depois de 1 ano) com prontidão e marcos.",
    plannedPhase: "Fase 5 — Tarefas, decisões e jornada",
  },
  orcamento: {
    key: "orcamento",
    href: "/app/orcamento",
    label: "Orçamento",
    icon: WalletIcon,
    description:
      "Pago, comprometido e pendente por categoria, fase e fornecedor.",
    plannedPhase: "Fase 6 — Dashboard e orçamento",
  },
  atividade: {
    key: "atividade",
    href: "/app/atividade",
    label: "Atividade",
    icon: ClockCounterClockwiseIcon,
    description: "Histórico de tudo que mudou: quem, o quê, origem e quando.",
    plannedPhase: "Fase 3 — Necessidades (histórico)",
  },
  configuracoes: {
    key: "configuracoes",
    href: "/app/configuracoes",
    label: "Configurações",
    icon: GearSixIcon,
    description:
      "Família, integração com o Notion, sincronização e exportação de dados.",
    plannedPhase: "Fases 2 e 7 — Auth e integração Notion",
  },
};

/** Sidebar desktop (SDD, seção 11.2). */
export const PRIMARY_NAV: NavItem[] = [
  MODULES.dashboard,
  MODULES.necessidades,
  MODULES.compras,
  MODULES.estoque,
  MODULES.tarefas,
  MODULES.decisoes,
  MODULES.jornada,
  MODULES.orcamento,
  MODULES.configuracoes,
];

/** Barra inferior mobile (SDD, seção 11.3): 4 itens + "Mais". */
export const MOBILE_NAV: NavItem[] = [
  MODULES.dashboard,
  MODULES.necessidades,
  MODULES.tarefas,
  MODULES.compras,
];

/** Conteúdo da folha "Mais" no mobile (SDD, seção 11.3). */
export const MORE_NAV: NavItem[] = [
  MODULES.estoque,
  MODULES.decisoes,
  MODULES.jornada,
  MODULES.orcamento,
  MODULES.configuracoes,
];

/** Encontra o módulo ativo a partir do pathname atual. */
export function findModuleByPathname(pathname: string): NavItem | undefined {
  return Object.values(MODULES).find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
