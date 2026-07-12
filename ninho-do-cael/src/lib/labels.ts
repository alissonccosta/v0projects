import {
  CATEGORIES,
  PRIORITIES,
  USAGE_PHASES,
  type Category,
  type Priority,
  type ResponsibleParty,
  type NeedAudience,
  type NeedType,
  type UsagePhase,
} from "@/types/domain";

/** Rótulos pt-BR centralizados dos domínios que não são "status" (seção 9). */

export const CATEGORY_LABELS: Record<Category, string> = {
  sono: "Sono",
  amamentacao: "Amamentação",
  higiene: "Higiene",
  transporte: "Transporte",
  roupas: "Roupas",
  fraldas: "Fraldas",
  maternidade: "Maternidade",
  pos_parto: "Pós-parto",
  quarto: "Quarto",
  desenvolvimento: "Desenvolvimento",
  seguranca: "Segurança",
  documentos: "Documentos",
  alimentacao: "Alimentação",
};

export const PHASE_LABELS: Record<UsagePhase, string> = {
  antes_do_parto: "Antes do parto",
  meses_0_3: "0–3 meses",
  meses_3_6: "3–6 meses",
  meses_6_12: "6–12 meses",
  apos_12_meses: "Após 12 meses",
  continuo: "Contínuo",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const RESPONSIBLE_LABELS: Record<ResponsibleParty, string> = {
  mae: "Duda",
  pai: "Alisson",
  casal: "Casal",
  obstetra: "Obstetra",
  pediatra: "Pediatra",
  maternidade: "Maternidade",
  outro: "Outro",
};

export const NEED_TYPE_LABELS: Record<NeedType, string> = {
  produto: "Produto",
  consumivel: "Consumível",
  servico: "Serviço",
  documento: "Documento",
  outro: "Outro",
};

export const AUDIENCE_LABELS: Record<NeedAudience, string> = {
  bebe: "Cael",
  mae: "Duda",
  pais: "Pais",
  casa: "Casa",
};

export { CATEGORIES, PRIORITIES, USAGE_PHASES };
