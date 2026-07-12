import { z } from "zod";

import {
  ACQUISITION_STATUSES,
  CATEGORIES,
  CRITICALITIES,
  LOGISTICS_STATUSES,
  NEED_AUDIENCES,
  NEED_DECISION_STATUSES,
  NEED_TYPES,
  PRIORITIES,
  READINESS_STATUSES,
  RESPONSIBLE_PARTIES,
  USAGE_PHASES,
} from "@/types/domain";

/** Schemas de necessidade (SDD, seções 16 e 29). */

const optionalQuantity = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce
    .number("Informe um número.")
    .nonnegative("Não pode ser negativo.")
    .optional(),
);

const optionalPrice = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce
    .number("Informe um valor.")
    .nonnegative("Não pode ser negativo.")
    .optional(),
);

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

export const createNeedSchema = z.object({
  // Obrigatórios (seção 16)
  title: z.string().trim().min(1, "Dê um título à necessidade.").max(200),
  type: z.enum(NEED_TYPES),
  audience: z.enum(NEED_AUDIENCES),
  category: z.enum(CATEGORIES),
  phase: z.enum(USAGE_PHASES),
  criticality: z.enum(CRITICALITIES),
  priority: z.enum(PRIORITIES),
  decision_status: z.enum(NEED_DECISION_STATUSES),
  acquisition_status: z.enum(ACQUISITION_STATUSES),
  logistics_status: z.enum(LOGISTICS_STATUSES),
  readiness_status: z.enum(READINESS_STATUSES),
  responsible: z.enum(RESPONSIBLE_PARTIES),
  // Opcionais
  required_quantity: optionalQuantity,
  available_quantity: optionalQuantity,
  unit: optionalText(30),
  estimated_price: optionalPrice,
  paid_price: optionalPrice,
  due_date: optionalDate,
  audit_notes: optionalText(2000),
  original_content: optionalText(8000),
});

export const updateNeedSchema = createNeedSchema.partial().extend({
  /** true arquiva, false restaura (soft delete — seção 10.10). */
  arquivada: z.boolean().optional(),
});

export type CreateNeedInput = z.infer<typeof createNeedSchema>;
export type UpdateNeedInput = z.infer<typeof updateNeedSchema>;

export const updateQuantitySchema = z.object({
  available_quantity: z.coerce
    .number("Informe um número.")
    .nonnegative("Não pode ser negativo."),
});
