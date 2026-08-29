import { describe, expect, it } from "vitest";

import {
  buildBudgetIndicators,
  committedEvolution,
  paidVsPending,
  spendByCategorySlices,
  spendByPhaseSlices,
  spendBySupplier,
  type BudgetPurchase,
} from "@/lib/budget/model";

function purchase(
  partial: Partial<BudgetPurchase> & { id: string },
): BudgetPurchase {
  return {
    title: partial.id,
    status: "entregue",
    supplier: null,
    subtotal: 100,
    discount: 0,
    shipping: 0,
    total: 100,
    returnedAmount: 0,
    purchasedAt: "2026-07-01",
    items: [
      { allocatedTotal: 100, category: "higiene", phase: "antes_do_parto" },
    ],
    ...partial,
  };
}

describe("buildBudgetIndicators (seção 23)", () => {
  it("separa pago, a caminho, estimativas, economia, frete e devolvido", () => {
    const indicators = buildBudgetIndicators(
      [
        purchase({
          id: "entregue",
          total: 100,
          discount: 10,
          shipping: 15,
          returnedAmount: 20,
        }),
        purchase({ id: "enviada", status: "enviada", total: 50, shipping: 5 }),
        purchase({ id: "cancelada", status: "cancelada", total: 999 }),
      ],
      [
        {
          acquisitionStatus: "aguardando_compra",
          phase: "antes_do_parto",
          estimatedPrice: 80,
          archived: false,
        },
        {
          acquisitionStatus: "aguardar",
          phase: "meses_6_12",
          estimatedPrice: 40,
          archived: false,
        },
        {
          acquisitionStatus: "comprado",
          phase: "antes_do_parto",
          estimatedPrice: 999,
          archived: false,
        },
      ],
    );
    expect(indicators.committed).toBe(130); // (100−20) + 50
    expect(indicators.paid).toBe(80);
    expect(indicators.awaiting).toBe(50);
    expect(indicators.pendingEstimate).toBe(120);
    expect(indicators.pendingEstimateUntilBirth).toBe(80);
    expect(indicators.savings).toBe(10);
    expect(indicators.shippingTotal).toBe(20);
    expect(indicators.returnedTotal).toBe(20);
    expect(paidVsPending(indicators)).toEqual({
      paid: 80,
      awaiting: 50,
      pendingEstimate: 120,
    });
  });
});

describe("quebras por categoria, fase e fornecedor", () => {
  it("kit com um item servindo várias necessidades conta uma vez só", () => {
    // Um item de R$ 90 vinculado a uma categoria: nada duplica por vínculo.
    const slices = spendByCategorySlices([
      purchase({
        id: "kit",
        total: 90,
        items: [{ allocatedTotal: 90, category: "sono", phase: null }],
      }),
    ]);
    expect(slices).toEqual([{ key: "sono", label: "Sono", amount: 90 }]);
  });

  it("rateia devolução e agrupa sem vínculo/sem fase", () => {
    const purchases = [
      purchase({
        id: "p",
        total: 100,
        returnedAmount: 10,
        items: [
          { allocatedTotal: 60, category: "higiene", phase: "antes_do_parto" },
          { allocatedTotal: 40, category: null, phase: null },
        ],
      }),
    ];
    expect(spendByCategorySlices(purchases)).toEqual([
      { key: "higiene", label: "Higiene", amount: 54 },
      { key: "sem_vinculo", label: "Sem vínculo", amount: 36 },
    ]);
    expect(spendByPhaseSlices(purchases)).toEqual([
      { key: "antes_do_parto", label: "Antes do parto", amount: 54 },
      { key: "sem_fase", label: "Sem fase", amount: 36 },
    ]);
  });

  it("fornecedores normalizados, com contagem de compras", () => {
    const suppliers = spendBySupplier([
      purchase({ id: "a", supplier: "Amazon", total: 100 }),
      purchase({
        id: "b",
        supplier: "amazon",
        total: 50,
        items: [{ allocatedTotal: 50, category: null, phase: null }],
      }),
      purchase({
        id: "c",
        supplier: null,
        total: 30,
        items: [{ allocatedTotal: 30, category: null, phase: null }],
      }),
    ]);
    expect(suppliers[0]).toMatchObject({
      label: "Amazon",
      amount: 150,
      purchases: 2,
    });
    expect(suppliers[1]).toMatchObject({
      label: "Sem fornecedor",
      amount: 30,
      purchases: 1,
    });
  });
});

describe("committedEvolution", () => {
  it("acumula por data de compra, ignorando canceladas", () => {
    const evolution = committedEvolution([
      purchase({
        id: "b",
        purchasedAt: "2026-07-10",
        total: 50,
        items: [{ allocatedTotal: 50, category: null, phase: null }],
      }),
      purchase({
        id: "a",
        purchasedAt: "2026-07-01",
        total: 100,
        returnedAmount: 10,
      }),
      purchase({ id: "c", status: "cancelada", purchasedAt: "2026-07-05" }),
    ]);
    expect(evolution).toEqual([
      { date: "2026-07-01", cumulative: 90 },
      { date: "2026-07-10", cumulative: 140 },
    ]);
  });
});
