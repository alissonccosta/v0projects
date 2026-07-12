import type { NextRequest } from "next/server";

import { requireMemberApi } from "@/lib/api/require-member";
import { apiError, apiOk } from "@/lib/api/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validation/commerce";
import { createProduct } from "@/server/services/commerce-service";

/** GET /api/products — lista com vínculos de necessidade. */
export async function GET() {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, family, brand, model, variant, color, size_label, status, store, url, reference_price, paid_price, compatibility, reason, archived_at, need_products(need_id, is_preferred)",
    )
    .order("created_at", { ascending: true });
  if (error) {
    return apiError("consulta", "Falha ao listar produtos.", { status: 500 });
  }
  return apiOk(data ?? []);
}

/** POST /api/products — cadastra (e opcionalmente vincula a uma necessidade). */
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

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  const id = await createProduct(
    supabase,
    { profileId: auth.session.userId, householdId: auth.session.householdId },
    parsed.data,
  );
  return apiOk({ id }, { status: 201 });
}
