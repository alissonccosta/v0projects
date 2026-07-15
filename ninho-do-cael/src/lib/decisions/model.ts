import type { DecisionStatus, DecisionType } from "@/types/domain";

/**
 * Separação de decisões (SDD, seção 21): exigem ação, aguardando
 * profissional, decididas, revisar depois e descartadas. Decisões médicas
 * nunca recebem conclusão automática (10.11) — a regra vive no serviço e
 * no banco; aqui ficam os agrupamentos e marcadores puros.
 */

export const DECISION_GROUPS = [
  {
    key: "exigem_acao",
    label: "Exigem ação",
    description: "Pendentes ou em análise — dependem de vocês dois.",
    statuses: ["pendente", "em_analise"] as const,
  },
  {
    key: "aguardando_profissional",
    label: "Aguardando profissional",
    description: "Só avançam com orientação de quem acompanha vocês.",
    statuses: ["aguardando_profissional"] as const,
  },
  {
    key: "decididas",
    label: "Decididas",
    description: "Concluídas com conclusão registrada.",
    statuses: ["decidida"] as const,
  },
  {
    key: "revisar_depois",
    label: "Revisar depois",
    description: "Decisões que merecem um segundo olhar mais adiante.",
    statuses: ["revisar_depois"] as const,
  },
  {
    key: "descartadas",
    label: "Descartadas",
    description: "Encerradas conscientemente, sem ação pendente.",
    statuses: ["descartada"] as const,
  },
] as const;

export type DecisionGroupKey = (typeof DECISION_GROUPS)[number]["key"];

export function decisionGroupKey(status: DecisionStatus): DecisionGroupKey {
  for (const group of DECISION_GROUPS) {
    if ((group.statuses as readonly DecisionStatus[]).includes(status)) {
      return group.key;
    }
  }
  // Inalcançável enquanto DECISION_GROUPS cobrir o enum inteiro (testado).
  return "exigem_acao";
}

export function groupDecisions<T extends { status: DecisionStatus }>(
  decisions: T[],
): Array<{
  key: DecisionGroupKey;
  label: string;
  description: string;
  items: T[];
}> {
  return DECISION_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    description: group.description,
    items: decisions.filter((decision) =>
      (group.statuses as readonly DecisionStatus[]).includes(decision.status),
    ),
  }));
}

/** 10.11 — decisões médicas têm tratamento especial em toda a interface. */
export function isMedicalDecision(type: DecisionType): boolean {
  return type === "medica";
}

/** Aviso permanente exigido pela seção 10.11 (tom da seção 37). */
export const MEDICAL_DECISION_NOTICE =
  "Decisão médica: o app organiza a pergunta e o histórico, mas a conclusão " +
  "vem sempre de profissional que acompanha vocês. Nada aqui substitui essa " +
  "orientação.";
