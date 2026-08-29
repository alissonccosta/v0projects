import { describe, expect, it } from "vitest";

import {
  buildAlerts,
  buildCountdown,
  buildFinancialBlock,
  buildNextActions,
  buildReadinessBlock,
  purchasesByStatus,
  readinessByCategory,
  scheduleByPhase,
  spendByCategory,
  type DashboardDecision,
  type DashboardNeed,
  type DashboardPurchase,
  type DashboardTask,
} from "@/lib/dashboard/model";

const TODAY = "2026-07-15";
const BIRTH = "2026-11-15";

function need(partial: Partial<DashboardNeed> & { id: string }): DashboardNeed {
  return {
    title: partial.id,
    category: "higiene",
    phase: "antes_do_parto",
    criticality: "media",
    priority: "media",
    responsible: "casal",
    decisionStatus: "precisa_pesquisar",
    acquisitionStatus: "aguardar",
    requiredQuantity: null,
    availableQuantity: null,
    estimatedPrice: null,
    dueDate: null,
    readiness: 0,
    overdue: false,
    archived: false,
    updatedAt: "2026-07-01T00:00:00Z",
    ...partial,
  };
}

function task(partial: Partial<DashboardTask> & { id: string }): DashboardTask {
  return {
    title: partial.id,
    status: "planejada",
    responsible: "casal",
    dueDate: null,
    blockedReason: null,
    dependencyTitle: null,
    updatedAt: "2026-07-01T00:00:00Z",
    ...partial,
  };
}

function decision(
  partial: Partial<DashboardDecision> & { id: string },
): DashboardDecision {
  return {
    title: partial.id,
    type: "familiar",
    status: "pendente",
    responsible: "casal",
    dueDate: null,
    updatedAt: "2026-07-01T00:00:00Z",
    ...partial,
  };
}

function purchase(
  partial: Partial<DashboardPurchase> & { id: string },
): DashboardPurchase {
  return {
    title: partial.id,
    status: "entregue",
    supplier: null,
    subtotal: 100,
    discount: 0,
    shipping: 0,
    total: 100,
    returnedAmount: 0,
    expectedDeliveryAt: null,
    items: [],
    ...partial,
  };
}

describe("buildCountdown (15.2/15.3)", () => {
  it("antes do parto: dias e marco derivado da data prevista", () => {
    const countdown = buildCountdown(BIRTH, TODAY);
    expect(countdown.daysRemaining).toBe(123);
    expect(countdown.phase).toBe("antes_do_parto");
    expect(countdown.nextMilestone).toContain("15/11/2026");
  });

  it("depois do nascimento muda a fase e aponta o próximo marco", () => {
    const countdown = buildCountdown(BIRTH, "2026-12-01");
    expect(countdown.daysRemaining).toBeLessThan(0);
    expect(countdown.phase).toBe("meses_0_3");
    expect(countdown.nextMilestone).toContain("15/02/2027");
  });
});

describe("buildReadinessBlock (15.3)", () => {
  it("pondera por criticidade e separa antes do parto", () => {
    const block = buildReadinessBlock([
      need({ id: "a", criticality: "critica", readiness: 1 }),
      need({ id: "b", criticality: "baixa", readiness: 0 }),
      need({
        id: "c",
        phase: "meses_6_12",
        criticality: "baixa",
        readiness: 0,
      }),
      need({ id: "d", archived: true, readiness: 0 }),
    ]);
    // Geral: (1*5 + 0 + 0) / 7; antes do parto exclui a fase futura: 5/6.
    expect(block.overall).toBeCloseTo(5 / 7, 4);
    expect(block.beforeBirth).toBeCloseTo(5 / 6, 4);
    expect(block.criticalPending).toBe(0);
    expect(block.totalActive).toBe(3);
  });

  it("conta críticas pendentes", () => {
    const block = buildReadinessBlock([
      need({ id: "a", criticality: "critica", readiness: 0.5 }),
    ]);
    expect(block.criticalPending).toBe(1);
  });
});

describe("buildFinancialBlock (15.3)", () => {
  it("pago, estimativas, economia e pedidos a caminho", () => {
    const block = buildFinancialBlock(
      [
        purchase({ id: "p1", total: 100, discount: 10, returnedAmount: 20 }),
        purchase({ id: "p2", status: "enviada", total: 50 }),
        purchase({ id: "p3", status: "cancelada", total: 999 }),
      ],
      [
        need({ id: "a", estimatedPrice: 80, acquisitionStatus: "aguardar" }),
        need({
          id: "b",
          estimatedPrice: 40,
          acquisitionStatus: "aguardando_compra",
          phase: "meses_6_12",
        }),
        need({ id: "c", estimatedPrice: 30, acquisitionStatus: "comprado" }),
      ],
    );
    expect(block.paid).toBe(130); // 100−20 + 50
    expect(block.pendingEstimate).toBe(120);
    expect(block.pendingEstimateUntilBirth).toBe(80);
    expect(block.savings).toBe(10);
    expect(block.awaitingDelivery).toBe(1);
  });
});

describe("buildNextActions (15.4)", () => {
  it("ordena vencido → crítico → prazo → bloqueador → prioridade → restante", () => {
    const actions = buildNextActions(
      {
        needs: [
          need({ id: "critica", criticality: "critica", readiness: 0.4 }),
          need({
            id: "vencida",
            dueDate: "2026-07-01",
            overdue: true,
            readiness: 0.2,
          }),
          need({ id: "alta", priority: "alta", readiness: 0.1 }),
          need({ id: "resto", readiness: 0.9 }),
        ],
        tasks: [
          task({
            id: "bloqueada",
            status: "bloqueada",
            dependencyTitle: "Dep",
          }),
          task({ id: "prazo", dueDate: "2026-07-18" }),
        ],
        decisions: [
          decision({ id: "prof", status: "aguardando_profissional" }),
        ],
      },
      TODAY,
    );
    expect(actions.map((action) => action.id)).toEqual([
      "vencida",
      "critica",
      "prazo",
      "bloqueada",
      "prof",
      "alta",
      "resto",
    ]);
    expect(actions[0]?.reasonKey).toBe("vencido");
    expect(actions[3]?.dependency).toBe("Dep");
  });

  it("não repete o mesmo item em dois motivos e respeita o limite", () => {
    const actions = buildNextActions(
      {
        needs: [
          need({
            id: "a",
            criticality: "critica",
            priority: "alta",
            dueDate: "2026-07-01",
            overdue: true,
            readiness: 0,
          }),
          need({ id: "b", readiness: 0.5 }),
        ],
        tasks: [],
        decisions: [],
      },
      TODAY,
      1,
    );
    expect(actions).toHaveLength(1);
    expect(actions[0]?.id).toBe("a");
    expect(actions[0]?.reasonKey).toBe("vencido");
  });

  it("prazo próximo considera até 7 dias", () => {
    const actions = buildNextActions(
      {
        needs: [
          need({ id: "perto", dueDate: "2026-07-22", readiness: 0.5 }),
          need({ id: "longe", dueDate: "2026-07-23", readiness: 0.5 }),
        ],
        tasks: [],
        decisions: [],
      },
      TODAY,
    );
    const perto = actions.find((action) => action.id === "perto");
    const longe = actions.find((action) => action.id === "longe");
    expect(perto?.reasonKey).toBe("prazo");
    expect(longe?.reasonKey).toBe("restante");
  });
});

describe("buildAlerts (15.5)", () => {
  it("gera os oito alertas quando as condições existem", () => {
    const alerts = buildAlerts(
      {
        needs: [
          need({
            id: "faltando",
            acquisitionStatus: "comprado",
            requiredQuantity: 3,
            availableQuantity: 1,
          }),
        ],
        tasks: [task({ id: "bloq", status: "bloqueada" })],
        decisions: [decision({ id: "med", type: "medica" })],
        purchases: [
          purchase({
            id: "late",
            status: "enviada",
            expectedDeliveryAt: "2026-07-01",
          }),
          purchase({
            id: "diverge",
            status: "entregue",
            subtotal: 100,
            discount: 0,
            shipping: 0,
            total: 90,
          }),
        ],
        inventory: [{ id: "i1", readinessStatus: "precisa_lavar" }],
        openSyncConflicts: 2,
      },
      TODAY,
    );
    const keys = alerts.map((alert) => alert.key);
    expect(keys).toContain("decisao_medica");
    expect(keys).toContain("pedido_atrasado");
    expect(keys).toContain("tarefa_bloqueada");
    expect(keys).toContain("custo_divergente");
    expect(keys).toContain("compra_sem_entrega");
    expect(keys).toContain("entregue_sem_preparo");
    expect(keys).toContain("quantidade_insuficiente");
    expect(keys).toContain("conflito");
    for (const alert of alerts) {
      expect(alert.count).toBeGreaterThan(0);
      expect(alert.href.startsWith("/app/")).toBe(true);
    }
  });

  it("sem condições, sem alertas — nada inventado", () => {
    const alerts = buildAlerts(
      {
        needs: [need({ id: "ok", readiness: 1 })],
        tasks: [],
        decisions: [],
        purchases: [],
        inventory: [],
        openSyncConflicts: 0,
      },
      TODAY,
    );
    expect(alerts).toHaveLength(0);
  });
});

describe("gráficos (15.6)", () => {
  it("prontidão por categoria só com categorias povoadas", () => {
    const data = readinessByCategory([
      need({ id: "a", category: "sono", criticality: "baixa", readiness: 1 }),
      need({ id: "b", category: "sono", criticality: "baixa", readiness: 0 }),
      need({ id: "c", category: "fraldas", readiness: 0.5 }),
    ]);
    expect(data).toHaveLength(2);
    expect(data.find((d) => d.category === "sono")?.percent).toBe(50);
  });

  it("gastos por categoria com devolução rateada e sem vínculo", () => {
    const data = spendByCategory([
      purchase({
        id: "p",
        status: "entregue",
        total: 100,
        returnedAmount: 10,
        items: [
          { allocatedTotal: 60, category: "higiene" },
          { allocatedTotal: 40, category: null },
        ],
      }),
    ]);
    expect(data).toEqual([
      { category: "higiene", label: "Higiene", amount: 54 },
      { category: null, label: "Sem vínculo", amount: 36 },
    ]);
  });

  it("compras por status e cronograma por fase", () => {
    const statuses = purchasesByStatus(
      [purchase({ id: "a" }), purchase({ id: "b", status: "enviada" })],
      (status) => status,
    );
    expect(statuses.map((d) => `${d.status}:${d.count}`)).toEqual([
      "enviada:1",
      "entregue:1",
    ]);

    const schedule = scheduleByPhase([
      need({ id: "a", readiness: 1 }),
      need({ id: "b", readiness: 0 }),
      need({ id: "c", phase: "meses_0_3", readiness: 0 }),
    ]);
    expect(schedule[0]).toMatchObject({
      phase: "antes_do_parto",
      total: 2,
      ready: 1,
    });
  });
});
