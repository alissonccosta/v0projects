import type { SupabaseClient } from "@supabase/supabase-js";

import { getStatusVisual } from "@/components/status/status-config";
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
  type Countdown,
  type DashboardAlert,
  type DashboardNeed,
  type DashboardPurchase,
  type FinancialBlock,
  type NextAction,
  type PhaseScheduleDatum,
  type CategoryReadinessDatum,
  type CategorySpendDatum,
  type PurchaseStatusDatum,
  type ReadinessBlock,
} from "@/lib/dashboard/model";
import { buildNeedViewModel } from "@/lib/needs/view-model";
import { listNeeds } from "@/server/repositories/needs-repository";
import {
  listRecentActivity,
  type ActivityFeedItem,
} from "@/server/repositories/activity-repository";
import type {
  Category,
  DecisionStatus,
  DecisionType,
  PurchaseStatus,
  ReadinessStatus,
  ResponsibleParty,
  TaskStatus,
} from "@/types/domain";

/**
 * Monta o painel (seção 15) com consultas paralelas e agregação em memória
 * — agregados no servidor, sem N+1 (seção 32). A página e o /api/dashboard
 * usam o mesmo serviço.
 */

export type DashboardData = {
  baby: { name: string; birthDate: string } | null;
  countdown: Countdown | null;
  readiness: ReadinessBlock;
  financial: FinancialBlock;
  nextActions: NextAction[];
  alerts: DashboardAlert[];
  charts: {
    readinessByCategory: CategoryReadinessDatum[];
    spendByCategory: CategorySpendDatum[];
    purchasesByStatus: PurchaseStatusDatum[];
    scheduleByPhase: PhaseScheduleDatum[];
  };
  activity: ActivityFeedItem[];
};

export async function loadDashboardData(
  supabase: SupabaseClient,
  today: string,
): Promise<DashboardData> {
  const [
    babyResult,
    needRows,
    tasksResult,
    decisionsResult,
    purchasesResult,
    inventoryResult,
    conflictsResult,
    activity,
  ] = await Promise.all([
    supabase.from("babies").select("name, due_date").limit(1).maybeSingle(),
    listNeeds(supabase),
    supabase
      .from("tasks")
      .select(
        "id, title, status, responsible, due_date, blocked_reason, depends_on_task_id, updated_at",
      )
      .is("archived_at", null),
    supabase
      .from("decisions")
      .select("id, title, type, status, responsible, due_date, updated_at")
      .is("archived_at", null),
    supabase
      .from("purchases")
      .select(
        "id, title, status, supplier, subtotal, discount, shipping, total, returned_amount, expected_delivery_at, purchase_items(total, need:needs(category))",
      )
      .is("archived_at", null),
    supabase
      .from("inventory_items")
      .select("id, readiness_status")
      .is("archived_at", null),
    supabase
      .from("sync_conflicts")
      .select("id", { count: "exact", head: true })
      .eq("status", "aberto"),
    listRecentActivity(supabase, 10),
  ]);

  const needs: DashboardNeed[] = needRows.map((row) => {
    const view = buildNeedViewModel(row, today);
    return {
      id: view.id,
      title: view.title,
      category: view.category,
      phase: view.phase,
      criticality: view.criticality,
      priority: view.priority,
      responsible: view.responsible,
      decisionStatus: view.decisionStatus,
      acquisitionStatus: view.acquisitionStatus,
      requiredQuantity: view.requiredQuantity,
      availableQuantity: view.availableQuantity,
      estimatedPrice: view.estimatedPrice,
      dueDate: view.dueDate,
      readiness: view.readiness,
      overdue: view.overdue,
      archived: view.archivedAt !== null,
      updatedAt: view.updatedAt,
    };
  });

  const taskRows = (tasksResult.data ?? []) as unknown as Array<{
    id: string;
    title: string;
    status: string;
    responsible: string;
    due_date: string | null;
    blocked_reason: string | null;
    depends_on_task_id: string | null;
    updated_at: string;
  }>;
  const taskTitleById = new Map(taskRows.map((row) => [row.id, row.title]));
  const tasks = taskRows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status as TaskStatus,
    responsible: row.responsible as ResponsibleParty,
    dueDate: row.due_date,
    blockedReason: row.blocked_reason,
    dependencyTitle: row.depends_on_task_id
      ? (taskTitleById.get(row.depends_on_task_id) ?? null)
      : null,
    updatedAt: row.updated_at,
  }));

  const decisions = (
    (decisionsResult.data ?? []) as unknown as Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      responsible: string;
      due_date: string | null;
      updated_at: string;
    }>
  ).map((row) => ({
    id: row.id,
    title: row.title,
    type: row.type as DecisionType,
    status: row.status as DecisionStatus,
    responsible: row.responsible as ResponsibleParty,
    dueDate: row.due_date,
    updatedAt: row.updated_at,
  }));

  const purchases: DashboardPurchase[] = (
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
      expected_delivery_at: string | null;
      purchase_items: Array<{
        total: number;
        need: { category: string } | null;
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
    expectedDeliveryAt: row.expected_delivery_at,
    items: row.purchase_items.map((item) => ({
      allocatedTotal: Number(item.total),
      category: (item.need?.category as Category | undefined) ?? null,
    })),
  }));

  const inventory = (
    (inventoryResult.data ?? []) as unknown as Array<{
      id: string;
      readiness_status: string;
    }>
  ).map((row) => ({
    id: row.id,
    readinessStatus: row.readiness_status as ReadinessStatus,
  }));

  const baby = babyResult.data?.due_date
    ? {
        name: (babyResult.data.name as string | null) ?? "Cael",
        birthDate: babyResult.data.due_date as string,
      }
    : null;

  return {
    baby,
    countdown: baby ? buildCountdown(baby.birthDate, today) : null,
    readiness: buildReadinessBlock(needs),
    financial: buildFinancialBlock(purchases, needs),
    nextActions: buildNextActions({ needs, tasks, decisions }, today),
    alerts: buildAlerts(
      {
        needs,
        tasks,
        decisions,
        purchases,
        inventory,
        openSyncConflicts: conflictsResult.count ?? 0,
      },
      today,
    ),
    charts: {
      readinessByCategory: readinessByCategory(needs),
      spendByCategory: spendByCategory(purchases),
      purchasesByStatus: purchasesByStatus(
        purchases,
        (status) => getStatusVisual("compra", status).label,
      ),
      scheduleByPhase: scheduleByPhase(needs),
    },
    activity,
  };
}
