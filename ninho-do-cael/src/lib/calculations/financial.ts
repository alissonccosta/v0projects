import type { AcquisitionStatus, UsagePhase } from "@/types/domain";

/** Cálculos financeiros (SDD, seções 10.7–10.9 e 23). Valores em reais. */

/** 10.9 — total_paid = subtotal - discount + shipping (em centavos, sem drift). */
export function purchaseTotal(
  subtotal: number,
  discount: number,
  shipping: number,
): number {
  return centsToValue(
    toCents(subtotal) - toCents(discount) + toCents(shipping),
  );
}

/** 10.9 — divergência acima de R$ 0,01 deve gerar alerta. */
export function hasTotalDivergence(
  declaredTotal: number,
  subtotal: number,
  discount: number,
  shipping: number,
): boolean {
  return (
    Math.abs(
      toCents(declaredTotal) -
        toCents(purchaseTotal(subtotal, discount, shipping)),
    ) > 1
  );
}

export type PurchaseFinancialInput = {
  status: string;
  total: number;
  discount: number;
  returnedAmount: number;
};

/** Status que contam como dinheiro comprometido (10.7). */
const COMMITTED_STATUSES = new Set([
  "confirmada",
  "aguardando_envio",
  "enviada",
  "entregue_parcial",
  "entregue",
]);

/**
 * 10.7 — soma compras confirmadas/aguardando envio/enviadas/entregues.
 * Canceladas ficam de fora; devoluções abatem o valor devolvido.
 */
export function committedTotal(purchases: PurchaseFinancialInput[]): number {
  let cents = 0;
  for (const purchase of purchases) {
    if (COMMITTED_STATUSES.has(purchase.status)) {
      cents += toCents(purchase.total) - toCents(purchase.returnedAmount);
    }
    if (purchase.status === "devolvida") {
      // Devolução total: permanece apenas o que não foi reembolsado.
      cents += Math.max(
        toCents(purchase.total) - toCents(purchase.returnedAmount),
        0,
      );
    }
  }
  return centsToValue(cents);
}

/** Economia registrada: soma dos descontos das compras comprometidas (23). */
export function savingsTotal(purchases: PurchaseFinancialInput[]): number {
  let cents = 0;
  for (const purchase of purchases) {
    if (COMMITTED_STATUSES.has(purchase.status)) {
      cents += toCents(purchase.discount);
    }
  }
  return centsToValue(cents);
}

export type PendingEstimateInput = {
  acquisitionStatus: AcquisitionStatus;
  phase: UsagePhase;
  estimatedPrice: number | null;
  archived: boolean;
};

/** Status de aquisição que ainda vão gerar gasto (10.8). */
const PENDING_ACQUISITION = new Set<AcquisitionStatus>([
  "aguardar",
  "aguardando_compra",
  "elegivel_para_cha",
]);

/** Fases consideradas no modo "até o parto" (10.8 exclui fases futuras). */
const UNTIL_BIRTH_PHASES = new Set<UsagePhase>(["antes_do_parto", "continuo"]);

/**
 * 10.8 — soma estimativas de itens ainda não comprados. Exclui comprado,
 * já possui, não comprar e arquivados; no modo "até o parto", exclui fases
 * futuras.
 */
export function pendingEstimateTotal(
  needs: PendingEstimateInput[],
  mode: "ate_o_parto" | "total" = "total",
): number {
  let cents = 0;
  for (const need of needs) {
    if (need.archived) continue;
    if (!PENDING_ACQUISITION.has(need.acquisitionStatus)) continue;
    if (mode === "ate_o_parto" && !UNTIL_BIRTH_PHASES.has(need.phase)) continue;
    cents += toCents(need.estimatedPrice ?? 0);
  }
  return centsToValue(cents);
}

/**
 * Rateio proporcional em centavos (seção 18): distribui um valor entre os
 * itens na proporção dos pesos, sem perder nem inventar centavos — o resto
 * vai para os maiores restos (método de Hamilton).
 */
export function allocateProportionally(
  amount: number,
  weights: number[],
): number[] {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const amountCents = toCents(amount);
  if (amountCents === 0 || totalWeight <= 0 || weights.length === 0) {
    return weights.map(() => 0);
  }

  const raw = weights.map((weight) => (amountCents * weight) / totalWeight);
  const floors = raw.map((value) => Math.floor(value));
  let remainder = amountCents - floors.reduce((sum, value) => sum + value, 0);

  const byRemainder = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  const result = [...floors];
  for (const { index } of byRemainder) {
    if (remainder <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    remainder -= 1;
  }
  return result.map(centsToValue);
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function centsToValue(cents: number): number {
  return cents / 100;
}
