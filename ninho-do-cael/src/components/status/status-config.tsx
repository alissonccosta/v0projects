import {
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  ArrowElbowDownRightIcon,
  CalendarCheckIcon,
  ChatCircleDotsIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  ClockIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  CloudCheckIcon,
  CloudSlashIcon,
  CloudXIcon,
  DropIcon,
  ExclamationMarkIcon,
  EyeIcon,
  FireIcon,
  GiftIcon,
  HandPalmIcon,
  HourglassMediumIcon,
  HouseLineIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
  PackageIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  ProhibitIcon,
  ScalesIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  SparkleIcon,
  SprayBottleIcon,
  StethoscopeIcon,
  ThermometerIcon,
  TruckIcon,
  WarningCircleIcon,
  WindIcon,
  WrenchIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import type { BadgeTone } from "@/components/ui/badge";
import type {
  AcquisitionStatus,
  Criticality,
  DecisionStatus,
  LogisticsStatus,
  NeedDecisionStatus,
  Priority,
  ReadinessStatus,
  SyncStatus,
  TaskStatus,
} from "@/types/domain";

export type StatusVisual = {
  label: string;
  tone: BadgeTone;
  icon: Icon;
};

/**
 * Mapeamento visual centralizado de todos os domínios de status
 * (SDD, seção 14 — StatusBadge). Nenhum componente define cor ou rótulo
 * de status por conta própria.
 */
export const STATUS_CONFIG = {
  decisaoNecessidade: {
    precisa_pesquisar: {
      label: "Precisa pesquisar",
      tone: "warning",
      icon: MagnifyingGlassIcon,
    },
    pesquisando: {
      label: "Pesquisando",
      tone: "info",
      icon: MagnifyingGlassIcon,
    },
    comparando: { label: "Comparando", tone: "info", icon: ScalesIcon },
    escolhido: { label: "Escolhido", tone: "success", icon: CheckCircleIcon },
    adiado: { label: "Adiado", tone: "neutral", icon: PauseCircleIcon },
    decisao_profissional_pendente: {
      label: "Depende de profissional",
      tone: "danger",
      icon: StethoscopeIcon,
    },
    descartado: { label: "Descartado", tone: "outline", icon: ArchiveIcon },
  } satisfies Record<NeedDecisionStatus, StatusVisual>,

  aquisicao: {
    aguardar: { label: "Aguardar", tone: "neutral", icon: HourglassMediumIcon },
    aguardando_compra: {
      label: "Aguardando compra",
      tone: "warning",
      icon: ShoppingCartIcon,
    },
    elegivel_para_cha: {
      label: "Elegível para chá",
      tone: "sage",
      icon: GiftIcon,
    },
    comprado: { label: "Comprado", tone: "success", icon: CheckCircleIcon },
    ja_possui: { label: "Já possui", tone: "success", icon: HouseLineIcon },
    nao_comprar: { label: "Não comprar", tone: "outline", icon: ProhibitIcon },
  } satisfies Record<AcquisitionStatus, StatusVisual>,

  logistica: {
    nao_aplicavel: {
      label: "Não se aplica",
      tone: "outline",
      icon: MinusCircleIcon,
    },
    nao_confirmado: {
      label: "Não confirmado",
      tone: "neutral",
      icon: CircleDashedIcon,
    },
    aguardando_envio: {
      label: "Aguardando envio",
      tone: "warning",
      icon: ClockIcon,
    },
    enviado: { label: "Enviado", tone: "info", icon: TruckIcon },
    entregue: { label: "Entregue", tone: "success", icon: PackageIcon },
    devolvido: {
      label: "Devolvido",
      tone: "danger",
      icon: ArrowCounterClockwiseIcon,
    },
    cancelado: { label: "Cancelado", tone: "outline", icon: XCircleIcon },
  } satisfies Record<LogisticsStatus, StatusVisual>,

  prontidao: {
    nao_aplicavel: {
      label: "Não se aplica",
      tone: "outline",
      icon: MinusCircleIcon,
    },
    pendente: { label: "Pendente", tone: "neutral", icon: CircleDashedIcon },
    precisa_higienizar: {
      label: "Precisa higienizar",
      tone: "warning",
      icon: SprayBottleIcon,
    },
    precisa_lavar: { label: "Precisa lavar", tone: "warning", icon: DropIcon },
    precisa_esterilizar: {
      label: "Precisa esterilizar",
      tone: "warning",
      icon: ThermometerIcon,
    },
    precisa_arejar: {
      label: "Precisa arejar",
      tone: "warning",
      icon: WindIcon,
    },
    precisa_montar: {
      label: "Precisa montar",
      tone: "warning",
      icon: WrenchIcon,
    },
    precisa_instalar: {
      label: "Precisa instalar",
      tone: "warning",
      icon: WrenchIcon,
    },
    precisa_configurar: {
      label: "Precisa configurar",
      tone: "warning",
      icon: WrenchIcon,
    },
    precisa_validar: {
      label: "Precisa validar",
      tone: "info",
      icon: ShieldCheckIcon,
    },
    pronto_para_uso: {
      label: "Pronto para uso",
      tone: "success",
      icon: SparkleIcon,
    },
  } satisfies Record<ReadinessStatus, StatusVisual>,

  tarefa: {
    planejada: { label: "Planejada", tone: "neutral", icon: CalendarCheckIcon },
    em_andamento: { label: "Em andamento", tone: "info", icon: PlayCircleIcon },
    bloqueada: { label: "Bloqueada", tone: "danger", icon: HandPalmIcon },
    concluida: { label: "Concluída", tone: "success", icon: CheckCircleIcon },
    cancelada: { label: "Cancelada", tone: "outline", icon: XCircleIcon },
  } satisfies Record<TaskStatus, StatusVisual>,

  decisao: {
    pendente: { label: "Pendente", tone: "warning", icon: CircleDashedIcon },
    em_analise: { label: "Em análise", tone: "info", icon: ChatCircleDotsIcon },
    aguardando_profissional: {
      label: "Aguardando profissional",
      tone: "danger",
      icon: StethoscopeIcon,
    },
    decidida: { label: "Decidida", tone: "success", icon: CheckCircleIcon },
    revisar_depois: { label: "Revisar depois", tone: "neutral", icon: EyeIcon },
    descartada: { label: "Descartada", tone: "outline", icon: ArchiveIcon },
  } satisfies Record<DecisionStatus, StatusVisual>,

  criticidade: {
    critica: { label: "Crítica", tone: "danger", icon: FireIcon },
    alta: { label: "Alta", tone: "warning", icon: WarningCircleIcon },
    media: { label: "Média", tone: "info", icon: ExclamationMarkIcon },
    baixa: { label: "Baixa", tone: "neutral", icon: ArrowElbowDownRightIcon },
  } satisfies Record<Criticality, StatusVisual>,

  prioridade: {
    alta: {
      label: "Prioridade alta",
      tone: "warning",
      icon: WarningCircleIcon,
    },
    media: {
      label: "Prioridade média",
      tone: "info",
      icon: ExclamationMarkIcon,
    },
    baixa: {
      label: "Prioridade baixa",
      tone: "neutral",
      icon: ArrowElbowDownRightIcon,
    },
  } satisfies Record<Priority, StatusVisual>,

  sincronizacao: {
    synced: { label: "Sincronizado", tone: "success", icon: CloudCheckIcon },
    pending_push: {
      label: "Envio pendente",
      tone: "warning",
      icon: CloudArrowUpIcon,
    },
    pending_pull: {
      label: "Atualização pendente",
      tone: "warning",
      icon: CloudArrowDownIcon,
    },
    conflict: { label: "Conflito", tone: "danger", icon: WarningCircleIcon },
    error: { label: "Erro de sincronização", tone: "danger", icon: CloudXIcon },
    not_linked: {
      label: "Notion não conectado",
      tone: "outline",
      icon: CloudSlashIcon,
    },
  } satisfies Record<SyncStatus, StatusVisual>,
} as const;

export type StatusDomain = keyof typeof STATUS_CONFIG;
export type StatusValue<D extends StatusDomain> =
  keyof (typeof STATUS_CONFIG)[D] & string;

export function getStatusVisual<D extends StatusDomain>(
  domain: D,
  value: StatusValue<D>,
): StatusVisual {
  return STATUS_CONFIG[domain][value] as StatusVisual;
}
