import { z } from "zod";

import {
  ITEM_CONDITIONS,
  ITEM_ORIGINS,
  PAYMENT_METHODS,
  PRODUCT_STATUSES,
  PURCHASE_TYPES,
  READINESS_STATUSES,
} from "@/types/domain";

/** Schemas de produtos, compras e estoque (SDD, seções 17–19 e 29). */

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const optionalPrice = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce
    .number("Informe um valor.")
    .nonnegative("Não pode ser negativo.")
    .optional(),
);

const requiredMoney = z.coerce
  .number("Informe um valor.")
  .nonnegative("Não pode ser negativo.");

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.")
    .optional(),
);

const optionalUuid = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.uuid("Identificador inválido.").optional(),
);

export const productSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome ao produto.").max(200),
  family: optionalText(80),
  brand: optionalText(80),
  model: optionalText(120),
  variant: optionalText(80),
  color: optionalText(60),
  size_label: optionalText(60),
  status: z.enum(PRODUCT_STATUSES).default("candidato"),
  store: optionalText(120),
  url: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.url("Informe uma URL válida.").optional(),
  ),
  reference_price: optionalPrice,
  paid_price: optionalPrice,
  compatibility: optionalText(400),
  reason: optionalText(400),
  /** Necessidade a vincular (opcional) e se é a preferida dela. */
  need_id: optionalUuid,
  is_preferred: z.boolean().default(false),
});

export const purchaseItemSchema = z.object({
  description: z.string().trim().min(1, "Descreva o item.").max(200),
  quantity: z.coerce
    .number("Informe um número.")
    .positive("Quantidade deve ser maior que zero."),
  unit_price: requiredMoney,
  need_id: optionalUuid,
  product_id: optionalUuid,
});

export const purchaseSchema = z.object({
  title: z.string().trim().min(1, "Dê um título à compra.").max(200),
  type: z.enum(PURCHASE_TYPES).default("online"),
  supplier: optionalText(160),
  payment_method: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.enum(PAYMENT_METHODS).optional(),
  ),
  order_reference: optionalText(120),
  tracking_code: optionalText(120),
  purchased_at: optionalDate,
  expected_delivery_at: optionalDate,
  subtotal: requiredMoney,
  discount: requiredMoney.default(0),
  shipping: requiredMoney.default(0),
  notes: optionalText(2000),
  items: z
    .array(purchaseItemSchema)
    .min(1, "A compra precisa de ao menos um item."),
});

export const deliverySchema = z.object({
  delivered_at: optionalDate,
  location: optionalText(120),
  items: z
    .array(
      z.object({
        item_id: z.uuid(),
        delivered_quantity: z.coerce.number().nonnegative(),
        readiness: z.enum(READINESS_STATUSES),
      }),
    )
    .min(1),
});

export const returnSchema = z.object({
  kind: z.enum(["parcial", "total"]),
  amount: z.coerce
    .number("Informe o valor devolvido.")
    .positive("Valor deve ser maior que zero."),
  reason: z.string().trim().min(1, "Informe o motivo da devolução.").max(400),
});

export const inventoryPatchSchema = z.object({
  quantity: z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? undefined : value,
    z.coerce.number().nonnegative().optional(),
  ),
  condition: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.enum(ITEM_CONDITIONS).optional(),
  ),
  readiness_status: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.enum(READINESS_STATUSES).optional(),
  ),
  location: optionalText(120),
  origin: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.enum(ITEM_ORIGINS).optional(),
  ),
  notes: optionalText(1000),
});

export const batchReadinessSchema = z.object({
  item_ids: z.array(z.uuid()).min(1, "Selecione ao menos um item."),
  readiness_status: z.enum(READINESS_STATUSES),
});

export type ProductInput = z.infer<typeof productSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type ReturnInput = z.infer<typeof returnSchema>;
export type InventoryPatchInput = z.infer<typeof inventoryPatchSchema>;
export type BatchReadinessInput = z.infer<typeof batchReadinessSchema>;
