import type { ReadinessStatus } from "@/types/domain";

/**
 * Planejadores puros do fluxo de compra (SDD, seção 18). Os serviços apenas
 * executam o plano — toda a regra fica aqui, coberta por testes.
 */

export type PurchaseItemInput = {
  id: string;
  description: string;
  quantity: number;
  needId: string | null;
  productId: string | null;
};

export type DeliveryItemInput = {
  itemId: string;
  deliveredQuantity: number;
  /** Estado físico inicial do que chegou (precisa lavar/montar/…). */
  readiness: ReadinessStatus;
  location: string | null;
};

export type DeliveryPlan = {
  purchaseStatus: "entregue" | "entregue_parcial";
  inventoryInserts: Array<{
    name: string;
    quantity: number;
    readiness_status: ReadinessStatus;
    location: string | null;
    need_id: string | null;
    product_id: string | null;
  }>;
  needUpdates: Array<{
    needId: string;
    quantityToAdd: number;
    fullyDelivered: boolean;
  }>;
  preparationTasks: Array<{
    title: string;
    needId: string | null;
    readiness: ReadinessStatus;
  }>;
};

const PREPARATION_LABELS: Partial<Record<ReadinessStatus, string>> = {
  precisa_higienizar: "Higienizar",
  precisa_lavar: "Lavar",
  precisa_esterilizar: "Esterilizar",
  precisa_arejar: "Arejar",
  precisa_montar: "Montar",
  precisa_instalar: "Instalar",
  precisa_configurar: "Configurar",
  precisa_validar: "Validar",
};

export class DeliveryPlanError extends Error {}

/**
 * Confirmação de entrega (seção 18, "Ao confirmar"): decide o status do
 * pedido, o estoque a criar, as necessidades a atualizar e as tarefas de
 * preparo. Quantidade zero em um item significa "não veio nesta entrega".
 */
export function planDelivery(
  items: PurchaseItemInput[],
  delivery: DeliveryItemInput[],
): DeliveryPlan {
  if (items.length === 0) {
    throw new DeliveryPlanError("A compra não tem itens para entregar.");
  }

  const byId = new Map(items.map((item) => [item.id, item]));
  const unknown = delivery.find((entry) => !byId.has(entry.itemId));
  if (unknown) {
    throw new DeliveryPlanError("Item de entrega não pertence à compra.");
  }

  let anyDelivered = false;
  let allFull = true;

  const inventoryInserts: DeliveryPlan["inventoryInserts"] = [];
  const needQuantity = new Map<string, number>();
  const needFull = new Map<string, boolean>();
  const preparationTasks: DeliveryPlan["preparationTasks"] = [];

  for (const item of items) {
    const entry = delivery.find((candidate) => candidate.itemId === item.id);
    const delivered = entry?.deliveredQuantity ?? 0;

    if (delivered < 0 || delivered > item.quantity) {
      throw new DeliveryPlanError(
        `Quantidade entregue inválida para "${item.description}".`,
      );
    }
    if (delivered === 0) {
      allFull = false;
      continue;
    }
    anyDelivered = true;
    if (delivered < item.quantity) {
      allFull = false;
    }

    const readiness = entry!.readiness;
    inventoryInserts.push({
      name: item.description,
      quantity: delivered,
      readiness_status: readiness,
      location: entry!.location,
      need_id: item.needId,
      product_id: item.productId,
    });

    if (item.needId) {
      needQuantity.set(
        item.needId,
        (needQuantity.get(item.needId) ?? 0) + delivered,
      );
      const previous = needFull.get(item.needId);
      const thisFull = delivered >= item.quantity;
      needFull.set(
        item.needId,
        previous === undefined ? thisFull : previous && thisFull,
      );
    }

    const label = PREPARATION_LABELS[readiness];
    if (label) {
      preparationTasks.push({
        title: `${label} ${item.description}`,
        needId: item.needId,
        readiness,
      });
    }
  }

  if (!anyDelivered) {
    throw new DeliveryPlanError("Informe ao menos um item entregue.");
  }

  return {
    purchaseStatus: allFull ? "entregue" : "entregue_parcial",
    inventoryInserts,
    needUpdates: [...needQuantity.entries()].map(([needId, quantityToAdd]) => ({
      needId,
      quantityToAdd,
      fullyDelivered: needFull.get(needId) ?? false,
    })),
    preparationTasks,
  };
}

export type ReturnPlan = {
  purchaseStatus: "devolvida" | null;
  returnedAmount: number;
};

export class ReturnPlanError extends Error {}

/** Devolução parcial ou total (seção 18): valida valor e decide o status. */
export function planReturn(input: {
  purchaseTotal: number;
  alreadyReturned: number;
  amount: number;
  kind: "parcial" | "total";
}): ReturnPlan {
  const remaining =
    Math.round(input.purchaseTotal * 100) -
    Math.round(input.alreadyReturned * 100);
  const amountCents = Math.round(input.amount * 100);

  if (amountCents <= 0) {
    throw new ReturnPlanError("O valor devolvido precisa ser maior que zero.");
  }
  if (amountCents > remaining) {
    throw new ReturnPlanError(
      "O valor devolvido não pode passar do que foi pago nesta compra.",
    );
  }
  if (input.kind === "total" && amountCents !== remaining) {
    throw new ReturnPlanError(
      "Na devolução total, o valor deve corresponder ao restante pago.",
    );
  }

  return {
    purchaseStatus: input.kind === "total" ? "devolvida" : null,
    returnedAmount:
      (Math.round(input.alreadyReturned * 100) + amountCents) / 100,
  };
}
