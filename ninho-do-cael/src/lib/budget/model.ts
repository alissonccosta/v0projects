import {
  committedTotal,
  netAllocatedItemTotals,
  pendingEstimateTotal,
  savingsTotal,
  type PendingEstimateInput,
} from "@/lib/calculations/financial";
import { CATEGORY_LABELS, PHASE_LABELS } from "@/lib/labels";
import type { Category, PurchaseStatus, UsagePhase } from "@/types/domain";

/**
 * Orçamento (SDD, seção 23). Regras aplicadas aqui:
 * - compra é a fonte financeira (nunca produto ou necessidade);
 * - necessidade só entra como estimativa enquanto não tem compra (10.8);
 * - kits não duplicam: cada item rateado conta uma única vez, mesmo servindo
 *   várias necessidades;
 * - frete e desconto ficam separados;
 * - devolução abate proporcionalmente (D-038).
 */

export type BudgetPurchase = {
  id: string;
  title: string;
  status: PurchaseStatus;
  supplier: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  returnedAmount: number;
  /** Data da compra; sem ela, a data de criação do registro. */
  purchasedAt: string;
  items: Array<{
    allocatedTotal: number;
    category: Category | null;
    phase: UsagePhase | null;
  }>;
};

export type BudgetNeed = PendingEstimateInput;

/** Status que contam dinheiro comprometido (10.7). */
const COMMITTED = new Set<PurchaseStatus>([
  "confirmada",
  "aguardando_envio",
  "enviada",
  "entregue_parcial",
  "entregue",
]);

/** Dinheiro já liquidado: chegou (ou voltou parcialmente). */
const SETTLED = new Set<PurchaseStatus>([
  "entregue",
  "entregue_parcial",
  "devolvida",
]);

export type BudgetIndicators = {
  /** Comprometido líquido (10.7): tudo que saiu ou vai sair do bolso. */
  committed: number;
  /** Parte do comprometido cuja compra já foi entregue/encerrada. */
  paid: number;
  /** Comprometido de pedidos ainda a caminho. */
  awaiting: number;
  /** Estimativas de necessidades ainda sem compra (10.8). */
  pendingEstimate: number;
  pendingEstimateUntilBirth: number;
  /** Economia registrada: descontos das compras comprometidas. */
  savings: number;
  /** Frete somado das compras comprometidas. */
  shippingTotal: number;
  /** Total devolvido (dinheiro que voltou). */
  returnedTotal: number;
};

export function buildBudgetIndicators(
  purchases: BudgetPurchase[],
  needs: BudgetNeed[],
): BudgetIndicators {
  const financial = purchases.map((purchase) => ({
    status: purchase.status,
    total: purchase.total,
    discount: purchase.discount,
    returnedAmount: purchase.returnedAmount,
  }));
  const committed = committedTotal(financial);
  const paid = committedTotal(
    financial.filter((purchase) =>
      SETTLED.has(purchase.status as PurchaseStatus),
    ),
  );
  let shippingTotal = 0;
  let returnedTotal = 0;
  for (const purchase of purchases) {
    if (COMMITTED.has(purchase.status) || purchase.status === "devolvida") {
      shippingTotal += toCents(purchase.shipping);
      returnedTotal += toCents(purchase.returnedAmount);
    }
  }
  return {
    committed,
    paid,
    awaiting: round2(committed - paid),
    pendingEstimate: pendingEstimateTotal(needs, "total"),
    pendingEstimateUntilBirth: pendingEstimateTotal(needs, "ate_o_parto"),
    savings: savingsTotal(financial),
    shippingTotal: fromCents(shippingTotal),
    returnedTotal: fromCents(returnedTotal),
  };
}

// ---------------------------------------------------------------------------
// Quebras por categoria, fase e fornecedor
// ---------------------------------------------------------------------------

export type BudgetSlice = { key: string; label: string; amount: number };

function sliceMap(
  purchases: BudgetPurchase[],
  keyOf: (item: BudgetPurchase["items"][number]) => {
    key: string;
    label: string;
  },
): BudgetSlice[] {
  const totals = new Map<string, BudgetSlice>();
  for (const purchase of purchases) {
    const nets = netAllocatedItemTotals(purchase);
    purchase.items.forEach((item, index) => {
      const net = nets[index] ?? 0;
      if (net <= 0) return;
      const { key, label } = keyOf(item);
      const current = totals.get(key) ?? { key, label, amount: 0 };
      current.amount = round2(current.amount + net);
      totals.set(key, current);
    });
  }
  return [...totals.values()].sort((a, b) => b.amount - a.amount);
}

export function spendByCategorySlices(
  purchases: BudgetPurchase[],
): BudgetSlice[] {
  return sliceMap(purchases, (item) =>
    item.category
      ? { key: item.category, label: CATEGORY_LABELS[item.category] }
      : { key: "sem_vinculo", label: "Sem vínculo" },
  );
}

export function spendByPhaseSlices(purchases: BudgetPurchase[]): BudgetSlice[] {
  return sliceMap(purchases, (item) =>
    item.phase
      ? { key: item.phase, label: PHASE_LABELS[item.phase] }
      : { key: "sem_fase", label: "Sem fase" },
  );
}

export type SupplierSlice = BudgetSlice & { purchases: number };

export function spendBySupplier(purchases: BudgetPurchase[]): SupplierSlice[] {
  const totals = new Map<string, SupplierSlice>();
  for (const purchase of purchases) {
    const net = netAllocatedItemTotals(purchase).reduce(
      (sum, value) => sum + value,
      0,
    );
    if (net <= 0) continue;
    const label = purchase.supplier?.trim() || "Sem fornecedor";
    const key = label.toLocaleLowerCase("pt-BR");
    const current = totals.get(key) ?? {
      key,
      label,
      amount: 0,
      purchases: 0,
    };
    current.amount = round2(current.amount + net);
    current.purchases += 1;
    totals.set(key, current);
  }
  return [...totals.values()].sort((a, b) => b.amount - a.amount);
}

// ---------------------------------------------------------------------------
// Evolução acumulada e pago x pendente
// ---------------------------------------------------------------------------

export type EvolutionPoint = { date: string; cumulative: number };

/** Comprometido líquido acumulado por data de compra (gráfico de evolução). */
export function committedEvolution(
  purchases: BudgetPurchase[],
): EvolutionPoint[] {
  const byDate = new Map<string, number>();
  for (const purchase of purchases) {
    if (!COMMITTED.has(purchase.status) && purchase.status !== "devolvida") {
      continue;
    }
    const net = netAllocatedItemTotals(purchase).reduce(
      (sum, value) => sum + value,
      0,
    );
    if (net <= 0) continue;
    const date = purchase.purchasedAt.slice(0, 10);
    byDate.set(date, round2((byDate.get(date) ?? 0) + net));
  }
  const points = [...byDate.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  let cumulative = 0;
  return points.map(([date, amount]) => {
    cumulative = round2(cumulative + amount);
    return { date, cumulative };
  });
}

export type PaidVsPending = {
  paid: number;
  awaiting: number;
  pendingEstimate: number;
};

export function paidVsPending(indicators: BudgetIndicators): PaidVsPending {
  return {
    paid: indicators.paid,
    awaiting: indicators.awaiting,
    pendingEstimate: indicators.pendingEstimate,
  };
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function fromCents(cents: number): number {
  return cents / 100;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
