import type { NextRequest } from "next/server";

import { requireMemberApi } from "@/lib/api/require-member";
import { apiError, apiOk } from "@/lib/api/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { purchaseSchema } from "@/lib/validation/commerce";
import { createPurchase } from "@/server/services/commerce-service";

/** GET /api/purchases — lista com contagem de itens. */
export async function GET() {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("purchases")
    .select(
      "id, title, type, status, supplier, payment_method, order_reference, tracking_code, purchased_at, expected_delivery_at, delivered_at, subtotal, discount, shipping, total, returned_amount, notes, purchase_items(count)",
    )
    .order("created_at", { ascending: false });
  if (error) {
    return apiError("consulta", "Falha ao listar compras.", { status: 500 });
  }
  return apiOk(data ?? []);
}

/** POST /api/purchases — registra compra com itens e rateio. */
export async function POST(request: NextRequest) {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("json_invalido", "Corpo da requisição não é JSON válido.", {
      status: 400,
    });
  }

  const parsed = purchaseSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  const id = await createPurchase(
    supabase,
    { profileId: auth.session.userId, householdId: auth.session.householdId },
    parsed.data,
  );
  return apiOk({ id }, { status: 201 });
}
