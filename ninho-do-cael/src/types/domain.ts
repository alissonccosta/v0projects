/**
 * Enums e domínios do produto (SDD, seções 7.6 e 9).
 *
 * Fonte única no TypeScript; a Fase 2 espelha estes valores como enums do
 * Postgres e a Fase 7 os mapeia para as opções do Notion.
 */

// 9.1 Categorias
export const CATEGORIES = [
  "sono",
  "amamentacao",
  "higiene",
  "transporte",
  "roupas",
  "fraldas",
  "maternidade",
  "pos_parto",
  "quarto",
  "desenvolvimento",
  "seguranca",
  "documentos",
  "alimentacao",
] as const;
export type Category = (typeof CATEGORIES)[number];

// 9.2 Fases de uso
export const USAGE_PHASES = [
  "antes_do_parto",
  "meses_0_3",
  "meses_3_6",
  "meses_6_12",
  "apos_12_meses",
  "continuo",
] as const;
export type UsagePhase = (typeof USAGE_PHASES)[number];

// 9.3 Criticidade
export const CRITICALITIES = ["critica", "alta", "media", "baixa"] as const;
export type Criticality = (typeof CRITICALITIES)[number];

// 9.4 Prioridade
export const PRIORITIES = ["alta", "media", "baixa"] as const;
export type Priority = (typeof PRIORITIES)[number];

// 9.5 Status de decisão da necessidade
export const NEED_DECISION_STATUSES = [
  "precisa_pesquisar",
  "pesquisando",
  "comparando",
  "escolhido",
  "adiado",
  "decisao_profissional_pendente",
  "descartado",
] as const;
export type NeedDecisionStatus = (typeof NEED_DECISION_STATUSES)[number];

// 9.6 Status de aquisição
export const ACQUISITION_STATUSES = [
  "aguardar",
  "aguardando_compra",
  "elegivel_para_cha",
  "comprado",
  "ja_possui",
  "nao_comprar",
] as const;
export type AcquisitionStatus = (typeof ACQUISITION_STATUSES)[number];

// 9.7 Status logístico
export const LOGISTICS_STATUSES = [
  "nao_aplicavel",
  "nao_confirmado",
  "aguardando_envio",
  "enviado",
  "entregue",
  "devolvido",
  "cancelado",
] as const;
export type LogisticsStatus = (typeof LOGISTICS_STATUSES)[number];

// 9.8 Status de prontidão
export const READINESS_STATUSES = [
  "nao_aplicavel",
  "pendente",
  "precisa_higienizar",
  "precisa_lavar",
  "precisa_esterilizar",
  "precisa_arejar",
  "precisa_montar",
  "precisa_instalar",
  "precisa_configurar",
  "precisa_validar",
  "pronto_para_uso",
] as const;
export type ReadinessStatus = (typeof READINESS_STATUSES)[number];

// 9.9 Status de tarefas
export const TASK_STATUSES = [
  "planejada",
  "em_andamento",
  "bloqueada",
  "concluida",
  "cancelada",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// 9.10 Status de decisões (registro de decisão)
export const DECISION_STATUSES = [
  "pendente",
  "em_analise",
  "aguardando_profissional",
  "decidida",
  "revisar_depois",
  "descartada",
] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];

// 7.6 Estados de sincronização
export const SYNC_STATUSES = [
  "synced",
  "pending_push",
  "pending_pull",
  "conflict",
  "error",
  "not_linked",
] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

// Domínios complementares do schema (decisão D-020)
export const NEED_TYPES = [
  "produto",
  "consumivel",
  "servico",
  "documento",
  "outro",
] as const;
export type NeedType = (typeof NEED_TYPES)[number];

export const NEED_AUDIENCES = ["bebe", "mae", "pais", "casa"] as const;
export type NeedAudience = (typeof NEED_AUDIENCES)[number];

export const RESPONSIBLE_PARTIES = [
  "mae",
  "pai",
  "casal",
  "obstetra",
  "pediatra",
  "maternidade",
  "outro",
] as const;
export type ResponsibleParty = (typeof RESPONSIBLE_PARTIES)[number];

export const PURCHASE_STATUSES = [
  "confirmada",
  "aguardando_envio",
  "enviada",
  "entregue_parcial",
  "entregue",
  "devolvida",
  "cancelada",
] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export const PURCHASE_TYPES = [
  "online",
  "loja_fisica",
  "presente",
  "servico",
  "outro",
] as const;
export type PurchaseType = (typeof PURCHASE_TYPES)[number];

export const PAYMENT_METHODS = [
  "pix",
  "cartao_credito",
  "cartao_debito",
  "boleto",
  "dinheiro",
  "outro",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ITEM_CONDITIONS = [
  "novo",
  "seminovo",
  "usado",
  "avariado",
] as const;
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const ITEM_ORIGINS = [
  "compra",
  "presente",
  "cha_de_bebe",
  "emprestimo",
  "ja_possuia",
  "outro",
] as const;
export type ItemOrigin = (typeof ITEM_ORIGINS)[number];

export const PRODUCT_STATUSES = [
  "candidato",
  "escolhido",
  "descartado",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
