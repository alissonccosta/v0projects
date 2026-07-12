import type { NextRequest } from "next/server";
import { z } from "zod";

import { requireMemberApi } from "@/lib/api/require-member";
import { apiError, apiOk } from "@/lib/api/result";
import { DeliveryPlanError } from "@/lib/purchases/plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deliverySchema } from "@/lib/validation/commerce";
import { deliverPurchase } from "@/server/services/commerce-service";

/** POST /api/purchases/:id/deliver — confirmação de entrega (seção 18). */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) {
    return apiError("id_invalido", "Identificador inválido.", { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("json_invalido", "Corpo da requisição não é JSON válido.", {
      status: 400,
    });
  }

  const parsed = deliverySchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  try {
    await deliverPurchase(
      supabase,
      { profileId: auth.session.userId, householdId: auth.session.householdId },
      id,
      parsed.data,
    );
  } catch (error) {
    if (error instanceof DeliveryPlanError) {
      return apiError("entrega_invalida", error.message, { status: 422 });
    }
    throw error;
  }
  return apiOk({ id, entregue: true });
}
