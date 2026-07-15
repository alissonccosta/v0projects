import { z } from "zod";

import { CATEGORIES, RESPONSIBLE_PARTIES, TASK_TYPES } from "@/types/domain";

/**
 * Schemas de tarefas (SDD, seções 20 e 29). Conclusão tem fluxo próprio:
 * exige confirmação do critério — por isso "concluida" não aparece aqui.
 */

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.")
    .optional(),
);

const optionalMoney = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? undefined : value,
  z.coerce
    .number("Informe um valor.")
    .nonnegative("Não pode ser negativo.")
    .optional(),
);

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.enum(values).optional(),
  );

const optionalUuid = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.uuid("Dependência inválida.").optional(),
);

/** Status editáveis no formulário — concluir passa pelo fluxo de conclusão. */
export const EDITABLE_TASK_STATUSES = [
  "planejada",
  "em_andamento",
  "bloqueada",
  "cancelada",
] as const;

export const taskSchema = z
  .object({
    title: z.string().trim().min(1, "Dê um título à tarefa.").max(200),
    type: z.enum(TASK_TYPES),
    category: optionalEnum(CATEGORIES),
    status: z.enum(
      EDITABLE_TASK_STATUSES,
      "Para concluir, use o fluxo de conclusão (com critério confirmado).",
    ),
    responsible: z.enum(RESPONSIBLE_PARTIES),
    due_date: optionalDate,
    window_start: optionalDate,
    window_end: optionalDate,
    estimated_cost: optionalMoney,
    depends_on_task_id: optionalUuid,
    blocked_reason: optionalText(500),
    completion_criteria: optionalText(1000),
    need_ids: z.array(z.uuid()).max(50).default([]),
  })
  .superRefine((value, context) => {
    if (
      value.window_start &&
      value.window_end &&
      value.window_start > value.window_end
    ) {
      context.addIssue({
        code: "custom",
        path: ["window_end"],
        message: "O fim do intervalo vem antes do início.",
      });
    }
    // Seção 20: bloqueada exibe dependência e bloqueador — exija ao menos um.
    if (
      value.status === "bloqueada" &&
      !value.depends_on_task_id &&
      !value.blocked_reason
    ) {
      context.addIssue({
        code: "custom",
        path: ["blocked_reason"],
        message: "Diga o que bloqueia ou aponte a tarefa da qual depende.",
      });
    }
  });

export type TaskInput = z.infer<typeof taskSchema>;

/** Conclusão (seção 20): critério confirmado; nota, custo e referência opcionais. */
export const completeTaskSchema = z.object({
  criteria_confirmed: z.literal(true, {
    error: "Confirme que o critério de conclusão foi atendido.",
  }),
  completion_notes: optionalText(2000),
  actual_cost: optionalMoney,
  completion_reference: optionalText(500),
});

export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;

/** PATCH parcial da API (seção 29). */
export const patchTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    type: z.enum(TASK_TYPES),
    category: optionalEnum(CATEGORIES),
    status: z.enum(
      EDITABLE_TASK_STATUSES,
      "Para concluir, use POST /api/tasks/:id/complete.",
    ),
    responsible: z.enum(RESPONSIBLE_PARTIES),
    due_date: optionalDate,
    window_start: optionalDate,
    window_end: optionalDate,
    estimated_cost: optionalMoney,
    depends_on_task_id: optionalUuid,
    blocked_reason: optionalText(500),
    completion_criteria: optionalText(1000),
    need_ids: z.array(z.uuid()).max(50),
  })
  .partial();

export type PatchTaskInput = z.infer<typeof patchTaskSchema>;
