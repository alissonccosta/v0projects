import { describe, expect, it } from "vitest";

import {
  CRITICALITY_WEIGHTS,
  decisionReadiness,
  isOverdue,
  overallReadiness,
  productNeedReadiness,
  quantityCoverage,
  taskReadiness,
} from "@/lib/calculations/readiness";

describe("quantityCoverage (10.2)", () => {
  it("cobre a fórmula min(disponível/necessário, 1)", () => {
    expect(quantityCoverage(4, 1)).toBe(0.25);
    expect(quantityCoverage(4, 4)).toBe(1);
    expect(quantityCoverage(4, 8)).toBe(1);
    expect(quantityCoverage(4, 0)).toBe(0);
    expect(quantityCoverage(4, null)).toBe(0);
  });

  it("sem quantidade exigida, não restringe", () => {
    expect(quantityCoverage(null, 0)).toBe(1);
    expect(quantityCoverage(0, 0)).toBe(1);
  });
});

describe("productNeedReadiness (10.3)", () => {
  it("item totalmente pronto soma 100%", () => {
    expect(
      productNeedReadiness({
        decisionStatus: "escolhido",
        acquisitionStatus: "comprado",
        logisticsStatus: "entregue",
        readinessStatus: "pronto_para_uso",
        requiredQuantity: 2,
        availableQuantity: 2,
      }),
    ).toBe(1);
  });

  it("comprado não significa pronto (10.1): entregue sem lavar fica sem os 20% físicos", () => {
    expect(
      productNeedReadiness({
        decisionStatus: "escolhido",
        acquisitionStatus: "comprado",
        logisticsStatus: "entregue",
        readinessStatus: "precisa_lavar",
        requiredQuantity: 8,
        availableQuantity: 8,
      }),
    ).toBe(0.8);
  });

  it("apenas decisão resolvida = 20% (+15% de cobertura livre quando sem quantidade)", () => {
    expect(
      productNeedReadiness({
        decisionStatus: "escolhido",
        acquisitionStatus: "aguardar",
        logisticsStatus: "nao_confirmado",
        readinessStatus: "pendente",
        requiredQuantity: null,
        availableQuantity: null,
      }),
    ).toBe(0.35);
  });

  it("cobertura parcial entra proporcional nos 15%", () => {
    expect(
      productNeedReadiness({
        decisionStatus: "precisa_pesquisar",
        acquisitionStatus: "aguardar",
        logisticsStatus: "nao_aplicavel",
        readinessStatus: "nao_aplicavel",
        requiredQuantity: 4,
        availableQuantity: 1,
      }),
    ).toBe(0.2 + 0.2 + 0.15 * 0.25);
  });
});

describe("taskReadiness (10.3)", () => {
  it("segue a tabela do SDD", () => {
    expect(taskReadiness("planejada")).toBe(0);
    expect(taskReadiness("em_andamento")).toBe(0.5);
    expect(taskReadiness("bloqueada")).toBe(0.2);
    expect(taskReadiness("concluida")).toBe(1);
    expect(taskReadiness("cancelada")).toBe(0);
    expect(taskReadiness("cancelada", { substituted: true })).toBeNull();
  });
});

describe("decisionReadiness (10.3)", () => {
  it("segue a tabela do SDD", () => {
    expect(decisionReadiness("pendente")).toBe(0);
    expect(decisionReadiness("em_analise")).toBe(0.35);
    expect(decisionReadiness("aguardando_profissional")).toBe(0.35);
    expect(decisionReadiness("decidida")).toBe(1);
    expect(decisionReadiness("revisar_depois")).toBe(0.6);
    expect(decisionReadiness("descartada")).toBe(1);
  });
});

describe("overallReadiness (10.4/10.5)", () => {
  it("pesos: crítica 5, alta 3, média 2, baixa 1", () => {
    expect(CRITICALITY_WEIGHTS).toEqual({
      critica: 5,
      alta: 3,
      media: 2,
      baixa: 1,
    });
  });

  it("pondera pela criticidade", () => {
    // (1*5 + 0*1) / 6 = 0.8333
    expect(
      overallReadiness([
        { readiness: 1, criticality: "critica" },
        { readiness: 0, criticality: "baixa" },
      ]),
    ).toBe(0.8333);
  });

  it("lista vazia é 0 (nunca NaN)", () => {
    expect(overallReadiness([])).toBe(0);
  });
});

describe("isOverdue (10.6)", () => {
  const today = "2026-07-12";

  it("vencido: data passada e não pronto", () => {
    expect(isOverdue({ dueDate: "2026-07-01", today, readiness: 0.5 })).toBe(
      true,
    );
  });

  it("não vencido: pronto, futuro, sem data ou descartado", () => {
    expect(isOverdue({ dueDate: "2026-07-01", today, readiness: 1 })).toBe(
      false,
    );
    expect(isOverdue({ dueDate: "2026-08-01", today, readiness: 0 })).toBe(
      false,
    );
    expect(isOverdue({ dueDate: null, today, readiness: 0 })).toBe(false);
    expect(
      isOverdue({
        dueDate: "2026-07-01",
        today,
        readiness: 0,
        decisionStatus: "descartado",
      }),
    ).toBe(false);
  });
});
