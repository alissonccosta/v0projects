import { describe, expect, it } from "vitest";

import { planDelivery, planReturn } from "@/lib/purchases/plan";

const ITEMS = [
  {
    id: "i1",
    description: "Bodies RN (kit 8)",
    quantity: 1,
    needId: "n-bodies",
    productId: null,
  },
  {
    id: "i2",
    description: "Macacões RN",
    quantity: 6,
    needId: "n-macacoes",
    productId: null,
  },
];

describe("planDelivery (seção 18)", () => {
  it("entrega completa: pedido entregue, estoque criado, necessidade completa e tarefa de preparo", () => {
    const plan = planDelivery(ITEMS, [
      {
        itemId: "i1",
        deliveredQuantity: 1,
        readiness: "precisa_lavar",
        location: "Cômoda",
      },
      {
        itemId: "i2",
        deliveredQuantity: 6,
        readiness: "precisa_lavar",
        location: "Cômoda",
      },
    ]);

    expect(plan.purchaseStatus).toBe("entregue");
    expect(plan.inventoryInserts).toHaveLength(2);
    expect(plan.inventoryInserts[0]).toMatchObject({
      name: "Bodies RN (kit 8)",
      quantity: 1,
      readiness_status: "precisa_lavar",
      need_id: "n-bodies",
    });
    expect(plan.needUpdates).toEqual([
      { needId: "n-bodies", quantityToAdd: 1, fullyDelivered: true },
      { needId: "n-macacoes", quantityToAdd: 6, fullyDelivered: true },
    ]);
    expect(plan.preparationTasks.map((task) => task.title)).toEqual([
      "Lavar Bodies RN (kit 8)",
      "Lavar Macacões RN",
    ]);
  });

  it("entrega parcial: status entregue_parcial e necessidade não completa", () => {
    const plan = planDelivery(ITEMS, [
      {
        itemId: "i2",
        deliveredQuantity: 4,
        readiness: "precisa_lavar",
        location: null,
      },
    ]);

    expect(plan.purchaseStatus).toBe("entregue_parcial");
    expect(plan.inventoryInserts).toHaveLength(1);
    expect(plan.needUpdates).toEqual([
      { needId: "n-macacoes", quantityToAdd: 4, fullyDelivered: false },
    ]);
  });

  it("item pronto para uso não gera tarefa de preparo", () => {
    const plan = planDelivery(
      [
        {
          id: "i3",
          description: "Termômetro",
          quantity: 1,
          needId: null,
          productId: null,
        },
      ],
      [
        {
          itemId: "i3",
          deliveredQuantity: 1,
          readiness: "pronto_para_uso",
          location: "Gaveta",
        },
      ],
    );
    expect(plan.preparationTasks).toEqual([]);
    expect(plan.needUpdates).toEqual([]);
  });

  it("valida quantidades e itens estranhos", () => {
    expect(() =>
      planDelivery(ITEMS, [
        {
          itemId: "i2",
          deliveredQuantity: 7,
          readiness: "precisa_lavar",
          location: null,
        },
      ]),
    ).toThrow(/Quantidade entregue inválida/);
    expect(() => planDelivery(ITEMS, [])).toThrow(/ao menos um item/);
    expect(() =>
      planDelivery(ITEMS, [
        {
          itemId: "zzz",
          deliveredQuantity: 1,
          readiness: "pronto_para_uso",
          location: null,
        },
      ]),
    ).toThrow(/não pertence à compra/);
  });
});

describe("planReturn (seção 18)", () => {
  it("devolução parcial mantém o pedido e acumula o valor", () => {
    expect(
      planReturn({
        purchaseTotal: 475,
        alreadyReturned: 0,
        amount: 100,
        kind: "parcial",
      }),
    ).toEqual({ purchaseStatus: null, returnedAmount: 100 });
  });

  it("devolução total muda o status e exige o valor restante", () => {
    expect(
      planReturn({
        purchaseTotal: 475,
        alreadyReturned: 100,
        amount: 375,
        kind: "total",
      }),
    ).toEqual({ purchaseStatus: "devolvida", returnedAmount: 475 });
    expect(() =>
      planReturn({
        purchaseTotal: 475,
        alreadyReturned: 100,
        amount: 300,
        kind: "total",
      }),
    ).toThrow(/valor deve corresponder/);
  });

  it("não deixa devolver mais do que foi pago", () => {
    expect(() =>
      planReturn({
        purchaseTotal: 475,
        alreadyReturned: 400,
        amount: 100,
        kind: "parcial",
      }),
    ).toThrow(/não pode passar/);
  });
});
