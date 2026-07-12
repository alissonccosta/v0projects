import type { SupabaseClient } from "@supabase/supabase-js";

import {
  allocateProportionally,
  purchaseTotal,
} from "@/lib/calculations/financial";
import { planDelivery, planReturn } from "@/lib/purchases/plan";
import type {
  BatchReadinessInput,
  DeliveryInput,
  ProductInput,
  PurchaseInput,
  ReturnInput,
} from "@/lib/validation/commerce";
import { insertActivityLog } from "@/server/repositories/needs-repository";

/**
 * Serviços de produtos, compras e estoque (SDD, seções 17–19): persistem,
 * executam os planos puros de lib/purchases/plan.ts e registram histórico.
 */

type Actor = { profileId: string; householdId: string };

function fail(message: string, error: { message: string } | null): never {
  throw new Error(`${message}: ${error?.message ?? "erro desconhecido"}`);
}

// ---------------------------------------------------------------------------
// Produtos (seção 17)
// ---------------------------------------------------------------------------
export async function createProduct(
  supabase: SupabaseClient,
  actor: Actor,
  input: ProductInput,
): Promise<string> {
  const { need_id, is_preferred, ...fields } = input;
  const { data, error } = await supabase
    .from("products")
    .insert({ ...fields, household_id: actor.householdId })
    .select("id")
    .single();
  if (error || !data) fail("Falha ao criar o produto", error);

  if (need_id) {
    await linkProductToNeed(supabase, actor, {
      needId: need_id,
      productId: data.id,
      isPreferred: is_preferred,
    });
  }

  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "product",
    entity_id: data.id,
    action: "criacao",
    changes: { name: input.name },
  });
  return data.id;
}

export async function updateProduct(
  supabase: SupabaseClient,
  actor: Actor,
  id: string,
  input: ProductInput,
): Promise<void> {
  const { need_id, is_preferred, ...fields } = input;
  const { error } = await supabase.from("products").update(fields).eq("id", id);
  if (error) fail("Falha ao atualizar o produto", error);

  if (need_id) {
    await linkProductToNeed(supabase, actor, {
      needId: need_id,
      productId: id,
      isPreferred: is_preferred,
    });
  }

  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "product",
    entity_id: id,
    action: "atualizacao",
    changes: { name: input.name },
  });
}

/** Vincula produto a necessidade; preferido é único por necessidade. */
export async function linkProductToNeed(
  supabase: SupabaseClient,
  actor: Actor,
  input: { needId: string; productId: string; isPreferred: boolean },
): Promise<void> {
  const { error } = await supabase.from("need_products").upsert(
    {
      household_id: actor.householdId,
      need_id: input.needId,
      product_id: input.productId,
      is_preferred: input.isPreferred,
    },
    { onConflict: "need_id,product_id" },
  );
  if (error) fail("Falha ao vincular produto à necessidade", error);

  if (input.isPreferred) {
    const { error: clearError } = await supabase
      .from("need_products")
      .update({ is_preferred: false })
      .eq("need_id", input.needId)
      .neq("product_id", input.productId);
    if (clearError) fail("Falha ao ajustar o produto preferido", clearError);
  }
}

// ---------------------------------------------------------------------------
// Compras (seção 18)
// ---------------------------------------------------------------------------
export async function createPurchase(
  supabase: SupabaseClient,
  actor: Actor,
  input: PurchaseInput,
): Promise<string> {
  const total = purchaseTotal(input.subtotal, input.discount, input.shipping);
  const { items, ...fields } = input;

  const { data, error } = await supabase
    .from("purchases")
    .insert({
      ...fields,
      total,
      status: "confirmada",
      household_id: actor.householdId,
    })
    .select("id")
    .single();
  if (error || !data) fail("Falha ao registrar a compra", error);

  // Rateio proporcional de desconto e frete pelos subtotais dos itens.
  const weights = items.map((item) =>
    Math.round(item.quantity * item.unit_price * 100),
  );
  const discounts = allocateProportionally(input.discount, weights);
  const shippings = allocateProportionally(input.shipping, weights);

  const rows = items.map((item, index) => {
    const itemSubtotal = item.quantity * item.unit_price;
    const allocatedDiscount = discounts[index] ?? 0;
    const allocatedShipping = shippings[index] ?? 0;
    return {
      household_id: actor.householdId,
      purchase_id: data.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      need_id: item.need_id ?? null,
      product_id: item.product_id ?? null,
      allocated_discount: allocatedDiscount,
      allocated_shipping: allocatedShipping,
      total: purchaseTotal(itemSubtotal, allocatedDiscount, allocatedShipping),
    };
  });
  const { error: itemsError } = await supabase
    .from("purchase_items")
    .insert(rows);
  if (itemsError) fail("Falha ao registrar os itens da compra", itemsError);

  // Necessidades vinculadas passam a "comprado" (seção 16/18).
  for (const item of items) {
    if (!item.need_id) continue;
    await supabase
      .from("needs")
      .update({
        acquisition_status: "comprado",
        logistics_status: "aguardando_envio",
      })
      .eq("id", item.need_id)
      .in("logistics_status", ["nao_aplicavel", "nao_confirmado"]);
    await supabase
      .from("needs")
      .update({ acquisition_status: "comprado" })
      .eq("id", item.need_id);
  }

  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "purchase",
    entity_id: data.id,
    action: "criacao",
    changes: { title: input.title, total },
  });
  return data.id;
}

export async function markPurchaseSent(
  supabase: SupabaseClient,
  actor: Actor,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("purchases")
    .update({ status: "enviada" })
    .eq("id", id)
    .in("status", ["confirmada", "aguardando_envio"]);
  if (error) fail("Falha ao marcar como enviada", error);
  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "purchase",
    entity_id: id,
    action: "atualizacao",
    changes: { status: { de: "aguardando_envio", para: "enviada" } },
  });
}

/** Confirmação de entrega (seção 18, "Ao confirmar") — executa o plano. */
export async function deliverPurchase(
  supabase: SupabaseClient,
  actor: Actor,
  purchaseId: string,
  input: DeliveryInput,
): Promise<void> {
  const { data: items, error: itemsError } = await supabase
    .from("purchase_items")
    .select("id, description, quantity, need_id, product_id")
    .eq("purchase_id", purchaseId);
  if (itemsError || !items) fail("Falha ao carregar os itens", itemsError);

  const plan = planDelivery(
    items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      needId: item.need_id,
      productId: item.product_id,
    })),
    input.items.map((item) => ({
      itemId: item.item_id,
      deliveredQuantity: item.delivered_quantity,
      readiness: item.readiness,
      location: input.location ?? null,
    })),
  );

  // 1. Pedido
  const { error: purchaseError } = await supabase
    .from("purchases")
    .update({
      status: plan.purchaseStatus,
      delivered_at: input.delivered_at ?? new Date().toISOString().slice(0, 10),
    })
    .eq("id", purchaseId);
  if (purchaseError) fail("Falha ao atualizar o pedido", purchaseError);

  // 2. Estoque
  const { error: inventoryError } = await supabase
    .from("inventory_items")
    .insert(
      plan.inventoryInserts.map((insert) => ({
        ...insert,
        household_id: actor.householdId,
        origin: "compra",
      })),
    );
  if (inventoryError) fail("Falha ao criar o estoque", inventoryError);

  // 3. Necessidades
  for (const update of plan.needUpdates) {
    const { data: need } = await supabase
      .from("needs")
      .select("available_quantity, readiness_status")
      .eq("id", update.needId)
      .maybeSingle();
    if (!need) continue;
    const readinessFromDelivery = plan.inventoryInserts.find(
      (insert) => insert.need_id === update.needId,
    )?.readiness_status;
    await supabase
      .from("needs")
      .update({
        available_quantity:
          Number(need.available_quantity ?? 0) + update.quantityToAdd,
        logistics_status: update.fullyDelivered ? "entregue" : "enviado",
        ...(need.readiness_status === "pendente" && readinessFromDelivery
          ? { readiness_status: readinessFromDelivery }
          : {}),
      })
      .eq("id", update.needId);
    await insertActivityLog(supabase, {
      household_id: actor.householdId,
      actor_profile_id: actor.profileId,
      entity_type: "need",
      entity_id: update.needId,
      action: "atualizacao",
      changes: { entrega: { quantidade: update.quantityToAdd } },
    });
  }

  // 4. Tarefas de preparo
  for (const task of plan.preparationTasks) {
    const { data: created } = await supabase
      .from("tasks")
      .insert({
        household_id: actor.householdId,
        title: task.title,
        type: "tarefa",
        status: "planejada",
        responsible: "casal",
        completion_criteria: "Item preparado e pronto para uso.",
      })
      .select("id")
      .single();
    if (created && task.needId) {
      await supabase.from("need_tasks").insert({
        household_id: actor.householdId,
        need_id: task.needId,
        task_id: created.id,
      });
    }
  }

  // 5. Histórico do pedido
  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "purchase",
    entity_id: purchaseId,
    action: "atualizacao",
    changes: {
      entrega: {
        status: plan.purchaseStatus,
        itens: plan.inventoryInserts.length,
        tarefas_de_preparo: plan.preparationTasks.length,
      },
    },
  });
}

export async function returnPurchase(
  supabase: SupabaseClient,
  actor: Actor,
  purchaseId: string,
  input: ReturnInput,
): Promise<void> {
  const { data: purchase, error } = await supabase
    .from("purchases")
    .select("total, returned_amount, return_reason")
    .eq("id", purchaseId)
    .maybeSingle();
  if (error || !purchase) fail("Compra não encontrada", error);

  const plan = planReturn({
    purchaseTotal: Number(purchase.total),
    alreadyReturned: Number(purchase.returned_amount),
    amount: input.amount,
    kind: input.kind,
  });

  const { error: updateError } = await supabase
    .from("purchases")
    .update({
      returned_amount: plan.returnedAmount,
      return_reason: [purchase.return_reason, input.reason]
        .filter(Boolean)
        .join(" · "),
      ...(plan.purchaseStatus ? { status: plan.purchaseStatus } : {}),
    })
    .eq("id", purchaseId);
  if (updateError) fail("Falha ao registrar a devolução", updateError);

  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "purchase",
    entity_id: purchaseId,
    action: "atualizacao",
    changes: { devolucao: { tipo: input.kind, valor: input.amount } },
  });
}

// ---------------------------------------------------------------------------
// Estoque (seção 19)
// ---------------------------------------------------------------------------
export async function updateInventoryReadiness(
  supabase: SupabaseClient,
  actor: Actor,
  input: BatchReadinessInput,
): Promise<number> {
  const { data: updated, error } = await supabase
    .from("inventory_items")
    .update({ readiness_status: input.readiness_status })
    .in("id", input.item_ids)
    .select("id, need_id");
  if (error) fail("Falha ao atualizar a prontidão", error);

  for (const item of updated ?? []) {
    // Item pronto propaga a prontidão para a necessidade vinculada.
    if (input.readiness_status === "pronto_para_uso" && item.need_id) {
      await supabase
        .from("needs")
        .update({ readiness_status: "pronto_para_uso" })
        .eq("id", item.need_id);
    }
    await insertActivityLog(supabase, {
      household_id: actor.householdId,
      actor_profile_id: actor.profileId,
      entity_type: "inventory_item",
      entity_id: item.id,
      action: "atualizacao",
      changes: { readiness_status: input.readiness_status },
    });
  }
  return (updated ?? []).length;
}
