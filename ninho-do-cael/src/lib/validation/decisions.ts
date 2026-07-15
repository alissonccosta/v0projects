import { z } from "zod";

import {
  DECISION_CONFIDENCES,
  DECISION_TYPES,
  RESPONSIBLE_PARTIES,
} from "@/types/domain";

/**
 * Schemas de decisões (SDD, seções 21 e 29). "Decidida" tem fluxo próprio
 * (exige conclusão registrada); decisões médicas ainda pedem confirmação de
 * que a orientação veio de profissional (10.11) — validado no serviço, que
 * conhece o tipo da decisão.
 */

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.")
    .optional(),
);

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const optionalConfidence = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.enum(DECISION_CONFIDENCES).optional(),
);

/** Status editáveis no formulário — decidir passa pelo fluxo de decisão. */
export const EDITABLE_DECISION_STATUSES = [
  "pendente",
  "em_analise",
  "aguardando_profissional",
  "revisar_depois",
  "descartada",
] as const;

export const decisionSchema = z.object({
  title: z.string().trim().min(1, "Dê um título à decisão.").max(200),
  pending_question: optionalText(500),
  type: z.enum(DECISION_TYPES),
  status: z.enum(
    EDITABLE_DECISION_STATUSES,
    "Para marcar como decidida, use o fluxo Decidir (com conclusão).",
  ),
  responsible: z.enum(RESPONSIBLE_PARTIES),
  confidence: optionalConfidence,
  due_date: optionalDate,
  impact: optionalText(500),
  source: optionalText(500),
  rationale: optionalText(2000),
  need_ids: z.array(z.uuid()).max(50).default([]),
});

export type DecisionInput = z.infer<typeof decisionSchema>;

/** Fluxo Decidir: conclusão obrigatória (10.11 no caso médico exige ainda confirmação). */
export const decideSchema = z.object({
  conclusion: z
    .string()
    .trim()
    .min(1, "Registre a conclusão da decisão.")
    .max(2000),
  rationale: optionalText(2000),
  source: optionalText(500),
  confidence: optionalConfidence,
  decided_at: optionalDate,
  /** Presente (true) apenas quando o formulário médico confirma a orientação. */
  medical_confirmed: z.boolean().default(false),
});

export type DecideInput = z.infer<typeof decideSchema>;

/** PATCH parcial da API (seção 29). */
export const patchDecisionSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    pending_question: optionalText(500),
    type: z.enum(DECISION_TYPES),
    status: z.enum(
      EDITABLE_DECISION_STATUSES,
      "Para decidir, envie conclusion via PATCH com status decidida — use o app.",
    ),
    responsible: z.enum(RESPONSIBLE_PARTIES),
    confidence: optionalConfidence,
    due_date: optionalDate,
    impact: optionalText(500),
    source: optionalText(500),
    rationale: optionalText(2000),
    need_ids: z.array(z.uuid()).max(50),
  })
  .partial();

export type PatchDecisionInput = z.infer<typeof patchDecisionSchema>;
