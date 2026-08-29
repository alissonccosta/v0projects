import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildBudgetIndicators,
  committedEvolution,
  paidVsPending,
  spendByCategorySlices,
  spendByPhaseSlices,
  spendBySupplier,
  type BudgetIndicators,
  type BudgetPurchase,
  type BudgetSlice,
  type EvolutionPoint,
  type PaidVsPending,
  type SupplierSlice,
} from "@/lib/budget/model";
import { listNeeds } from "@/server/repositories/needs-repository";
import type {
  AcquisitionStatus,
  Category,
  PurchaseStatus,
  UsagePhase,
} from "@/types/domain";

/** Monta o orçamento (seção 23) — compra é a fonte financeira. */

export type BudgetData = {
  indicators: BudgetIndicators;
  byCategory: BudgetSlice[];
  byPhase: BudgetSlice[];
  bySupplier: SupplierSlice[];
  evolution: EvolutionPoint[];
  paidVsPending: PaidVsPending;
  purchasesCount: number;
};

export async function loadBudgetData(
  supabase: SupabaseClient,
): Promise<BudgetData> {
  const [needRows, purchasesResult] = await Promise.all([
    listNeeds(supabase),
    supabase
      .from("purchases")
      .select(
        "id, title, status, supplier, subtotal, discount, shipping, total, returned_amount, purchased_at, created_at, purchase_items(total, need:needs(category, phase))",
      )
      .is("archived_at", null),
  ]);

  const purchases: BudgetPurchase[] = (
    (purchasesResult.data ?? []) as unknown as Array<{
      id: string;
      title: string;
      status: string;
      supplier: string | null;
      subtotal: number;
      discount: number;
      shipping: number;
      total: number;
      returned_amount: number;
      purchased_at: string | null;
      created_at: string;
      purchase_items: Array<{
        total: number;
        need: { category: string; phase: string } | null;
      }>;
    }>
  ).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status as PurchaseStatus,
    supplier: row.supplier,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    shipping: Number(row.shipping),
    total: Number(row.total),
    returnedAmount: Number(row.returned_amount),
    purchasedAt: row.purchased_at ?? row.created_at.slice(0, 10),
    items: row.purchase_items.map((item) => ({
      allocatedTotal: Number(item.total),
      category: (item.need?.category as Category | undefined) ?? null,
      phase: (item.need?.phase as UsagePhase | undefined) ?? null,
    })),
  }));

  const needs = needRows.map((row) => ({
    acquisitionStatus: row.acquisition_status as AcquisitionStatus,
    phase: row.phase as UsagePhase,
    estimatedPrice: row.estimated_price,
    archived: row.archived_at !== null,
  }));

  const indicators = buildBudgetIndicators(purchases, needs);
  return {
    indicators,
    byCategory: spendByCategorySlices(purchases),
    byPhase: spendByPhaseSlices(purchases),
    bySupplier: spendBySupplier(purchases),
    evolution: committedEvolution(purchases),
    paidVsPending: paidVsPending(indicators),
    purchasesCount: purchases.filter(
      (purchase) => purchase.status !== "cancelada",
    ).length,
  };
}
