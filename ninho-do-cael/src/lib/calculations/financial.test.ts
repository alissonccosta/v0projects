import { describe, expect, it } from "vitest";

import {
  allocateProportionally,
  committedTotal,
  hasTotalDivergence,
  pendingEstimateTotal,
  purchaseTotal,
  savingsTotal,
} from "@/lib/calculations/financial";

describe("purchaseTotal (10.9)", () => {
  it("total = subtotal - desconto + frete, sem drift de ponto flutuante", () => {
    expect(purchaseTotal(500, 50, 25)).toBe(475);
    expect(purchaseTotal(0.1, 0, 0.2)).toBe(0.3);
  });

  it("alerta divergência acima de R$ 0,01", () => {
    expect(hasTotalDivergence(475, 500, 50, 25)).toBe(false);
    expect(hasTotalDivergence(475.01, 500, 50, 25)).toBe(false);
    expect(hasTotalDivergence(475.02, 500, 50, 25)).toBe(true);
    expect(hasTotalDivergence(480, 500, 50, 25)).toBe(true);
  });
});

describe("committedTotal (10.7)", () => {
  const base = { discount: 0, returnedAmount: 0 };

  it("soma confirmada/aguardando/enviada/entregues e ignora cancelada", () => {
    expect(
      committedTotal([
        { ...base, status: "confirmada", total: 100 },
        { ...base, status: "aguardando_envio", total: 100 },
        { ...base, status: "enviada", total: 100 },
        { ...base, status: "entregue_parcial", total: 100 },
        { ...base, status: "entregue", total: 100 },
        { ...base, status: "cancelada", total: 999 },
      ]),
    ).toBe(500);
  });

  it("devolução abate o valor reembolsado (seção 18: impacto)", () => {
    expect(
      committedTotal([
        { ...base, status: "entregue", total: 200, returnedAmount: 50 },
        { ...base, status: "devolvida", total: 100, returnedAmount: 100 },
      ]),
    ).toBe(150);
  });
});

describe("savingsTotal (seção 23)", () => {
  it("soma descontos das compras comprometidas", () => {
    expect(
      savingsTotal([
        { status: "entregue", total: 475, discount: 50, returnedAmount: 0 },
        { status: "cancelada", total: 100, discount: 99, returnedAmount: 0 },
      ]),
    ).toBe(50);
  });
});

describe("pendingEstimateTotal (10.8)", () => {
  const needs = [
    {
      acquisitionStatus: "aguardando_compra",
      phase: "antes_do_parto",
      estimatedPrice: 100,
      archived: false,
    },
    {
      acquisitionStatus: "aguardar",
      phase: "continuo",
      estimatedPrice: 50,
      archived: false,
    },
    {
      acquisitionStatus: "elegivel_para_cha",
      phase: "meses_6_12",
      estimatedPrice: 700,
      archived: false,
    },
    {
      acquisitionStatus: "comprado",
      phase: "antes_do_parto",
      estimatedPrice: 999,
      archived: false,
    },
    {
      acquisitionStatus: "nao_comprar",
      phase: "antes_do_parto",
      estimatedPrice: 999,
      archived: false,
    },
    {
      acquisitionStatus: "aguardando_compra",
      phase: "antes_do_parto",
      estimatedPrice: 999,
      archived: true,
    },
  ] as const;

  it("modo total inclui fases futuras", () => {
    expect(pendingEstimateTotal([...needs], "total")).toBe(850);
  });

  it("modo até o parto exclui fases futuras (mantém contínuo)", () => {
    expect(pendingEstimateTotal([...needs], "ate_o_parto")).toBe(150);
  });
});

describe("allocateProportionally (rateio — seção 18)", () => {
  it("distribui proporcionalmente sem perder centavos", () => {
    // R$ 50 entre pesos 200 e 300 → 20 + 30
    expect(allocateProportionally(50, [200, 300])).toEqual([20, 30]);
    // R$ 0,01 entre dois itens iguais → um leva o centavo
    expect(allocateProportionally(0.01, [1, 1])).toEqual([0.01, 0]);
    // soma sempre bate com o valor original
    const parts = allocateProportionally(100, [33, 33, 34]);
    expect(parts.reduce((sum, part) => sum + part, 0)).toBeCloseTo(100, 2);
  });

  it("casos degenerados: sem peso ou valor zero", () => {
    expect(allocateProportionally(10, [])).toEqual([]);
    expect(allocateProportionally(0, [1, 2])).toEqual([0, 0]);
    expect(allocateProportionally(10, [0, 0])).toEqual([0, 0]);
  });
});
