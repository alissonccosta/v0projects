"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { ActionState } from "@/lib/auth/action-state";
import { getSessionInfo } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  batchReadinessSchema,
  deliverySchema,
  productSchema,
  purchaseSchema,
  returnSchema,
} from "@/lib/validation/commerce";
import {
  createProduct,
  createPurchase,
  deliverPurchase,
  markPurchaseSent,
  returnPurchase,
  updateInventoryReadiness,
  updateProduct,
} from "@/server/services/commerce-service";

type MemberContext = {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  actor: { profileId: string; householdId: string };
};

async function requireMemberContext(): Promise<
  { ok: true; context: MemberContext } | { ok: false; state: ActionState }
> {
  const session = await getSessionInfo();
  if (session.mode !== "member") {
    return {
      ok: false,
      state: {
        status: "error",
        message:
          session.mode === "demo"
            ? "Supabase não configurado — ações ficam disponíveis após o setup."
            : "Sessão expirada. Entre novamente.",
      },
    };
  }
  const supabase = await createSupabaseServerClient();
  return {
    ok: true,
    context: {
      supabase,
      actor: { profileId: session.userId, householdId: session.householdId },
    },
  };
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "(raiz)";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

/** Campos simples de FormData num objeto. */
function pick(formData: FormData, keys: string[]): Record<string, unknown> {
  const object: Record<string, unknown> = {};
  for (const key of keys) {
    object[key] = formData.get(key) ?? undefined;
  }
  return object;
}

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------
const PRODUCT_KEYS = [
  "name",
  "family",
  "brand",
  "model",
  "variant",
  "color",
  "size_label",
  "status",
  "store",
  "url",
  "reference_price",
  "paid_price",
  "compatibility",
  "reason",
  "need_id",
];

export async function salvarProduto(
  productId: string | null,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = productSchema.safeParse({
    ...pick(formData, PRODUCT_KEYS),
    is_preferred: formData.get("is_preferred") === "on",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  if (productId) {
    await updateProduct(
      member.context.supabase,
      member.context.actor,
      productId,
      parsed.data,
    );
  } else {
    await createProduct(
      member.context.supabase,
      member.context.actor,
      parsed.data,
    );
  }
  revalidatePath("/app/produtos");
  revalidatePath("/app/necessidades");
  return {
    status: "success",
    message: productId ? "Produto atualizado." : "Produto cadastrado.",
  };
}

// ---------------------------------------------------------------------------
// Compras
// ---------------------------------------------------------------------------
export async function criarCompra(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { status: "error", message: "Itens inválidos." };
  }

  const parsed = purchaseSchema.safeParse({
    ...pick(formData, [
      "title",
      "type",
      "supplier",
      "payment_method",
      "order_reference",
      "tracking_code",
      "purchased_at",
      "expected_delivery_at",
      "subtotal",
      "discount",
      "shipping",
      "notes",
    ]),
    items,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const id = await createPurchase(
    member.context.supabase,
    member.context.actor,
    parsed.data,
  );
  revalidatePath("/app/compras");
  revalidatePath("/app/necessidades");
  redirect(`/app/compras/${id}`);
}

export async function marcarEnviada(purchaseId: string): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;
  await markPurchaseSent(
    member.context.supabase,
    member.context.actor,
    purchaseId,
  );
  revalidatePath("/app/compras");
  revalidatePath(`/app/compras/${purchaseId}`);
  return { status: "success", message: "Marcada como enviada." };
}

export async function confirmarEntregaCompra(
  purchaseId: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { status: "error", message: "Itens de entrega inválidos." };
  }

  const parsed = deliverySchema.safeParse({
    delivered_at: formData.get("delivered_at") ?? undefined,
    location: formData.get("location") ?? undefined,
    items,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos da entrega.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await deliverPurchase(
      member.context.supabase,
      member.context.actor,
      purchaseId,
      parsed.data,
    );
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  revalidatePath("/app/compras");
  revalidatePath(`/app/compras/${purchaseId}`);
  revalidatePath("/app/estoque");
  revalidatePath("/app/necessidades");
  return {
    status: "success",
    message: "Entrega confirmada. Estoque e necessidades atualizados.",
  };
}

export async function registrarDevolucao(
  purchaseId: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = returnSchema.safeParse({
    kind: formData.get("kind"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos da devolução.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await returnPurchase(
      member.context.supabase,
      member.context.actor,
      purchaseId,
      parsed.data,
    );
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  revalidatePath("/app/compras");
  revalidatePath(`/app/compras/${purchaseId}`);
  revalidatePath("/app/orcamento");
  return { status: "success", message: "Devolução registrada." };
}

// ---------------------------------------------------------------------------
// Estoque
// ---------------------------------------------------------------------------
export async function atualizarProntidaoItens(
  itemIds: string[],
  readiness: string,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = batchReadinessSchema.safeParse({
    item_ids: itemIds,
    readiness_status: readiness,
  });
  if (!parsed.success) {
    return { status: "error", message: "Seleção inválida." };
  }

  const count = await updateInventoryReadiness(
    member.context.supabase,
    member.context.actor,
    parsed.data,
  );
  revalidatePath("/app/estoque");
  revalidatePath("/app/necessidades");
  return {
    status: "success",
    message:
      count === 1 ? "Prontidão atualizada." : `${count} itens atualizados.`,
  };
}
