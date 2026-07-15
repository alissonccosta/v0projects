import { describe, expect, it } from "vitest";

import { decideSchema, decisionSchema } from "@/lib/validation/decisions";
import { completeTaskSchema, taskSchema } from "@/lib/validation/tasks";

const validTask = {
  title: "Lavar as roupas 0–3",
  type: "tarefa",
  status: "planejada",
  responsible: "mae",
  need_ids: [],
};

describe("taskSchema (seção 20)", () => {
  it("aceita tarefa mínima", () => {
    const parsed = taskSchema.safeParse(validTask);
    expect(parsed.success).toBe(true);
  });

  it("rejeita concluída — conclusão tem fluxo próprio", () => {
    const parsed = taskSchema.safeParse({ ...validTask, status: "concluida" });
    expect(parsed.success).toBe(false);
  });

  it("bloqueada exige dependência ou bloqueador", () => {
    const semNada = taskSchema.safeParse({
      ...validTask,
      status: "bloqueada",
    });
    expect(semNada.success).toBe(false);

    const comMotivo = taskSchema.safeParse({
      ...validTask,
      status: "bloqueada",
      blocked_reason: "Aguardando o berço chegar",
    });
    expect(comMotivo.success).toBe(true);

    const comDependencia = taskSchema.safeParse({
      ...validTask,
      status: "bloqueada",
      depends_on_task_id: "6e0c25a5-7cbe-4f9e-a745-3b1a1f4e2b6a",
    });
    expect(comDependencia.success).toBe(true);
  });

  it("intervalo precisa estar em ordem", () => {
    const parsed = taskSchema.safeParse({
      ...validTask,
      window_start: "2026-08-10",
      window_end: "2026-08-01",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("completeTaskSchema (conclusão com critério)", () => {
  it("exige a confirmação do critério", () => {
    expect(completeTaskSchema.safeParse({}).success).toBe(false);
    expect(
      completeTaskSchema.safeParse({ criteria_confirmed: false }).success,
    ).toBe(false);
    expect(
      completeTaskSchema.safeParse({ criteria_confirmed: true }).success,
    ).toBe(true);
  });

  it("aceita nota, custo real e referência", () => {
    const parsed = completeTaskSchema.safeParse({
      criteria_confirmed: true,
      completion_notes: "Tudo lavado com sabão neutro",
      actual_cost: "35.90",
      completion_reference: "https://exemplo.com/instrucoes",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.actual_cost).toBe(35.9);
    }
  });

  it("custo negativo é rejeitado", () => {
    const parsed = completeTaskSchema.safeParse({
      criteria_confirmed: true,
      actual_cost: "-5",
    });
    expect(parsed.success).toBe(false);
  });
});

const validDecision = {
  title: "Qual carrinho comprar?",
  type: "tecnica",
  status: "pendente",
  responsible: "casal",
  need_ids: [],
};

describe("decisionSchema (seção 21)", () => {
  it("aceita decisão mínima", () => {
    expect(decisionSchema.safeParse(validDecision).success).toBe(true);
  });

  it("rejeita decidida — decidir tem fluxo próprio", () => {
    expect(
      decisionSchema.safeParse({ ...validDecision, status: "decidida" })
        .success,
    ).toBe(false);
  });
});

describe("decideSchema (fluxo Decidir)", () => {
  it("conclusão é obrigatória", () => {
    expect(decideSchema.safeParse({ conclusion: "" }).success).toBe(false);
    expect(decideSchema.safeParse({ conclusion: "   " }).success).toBe(false);
    const parsed = decideSchema.safeParse({
      conclusion: "Carrinho X, pelo peso e pela cadeirinha compatível.",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.medical_confirmed).toBe(false);
    }
  });
});
