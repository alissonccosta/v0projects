import type { NextRequest } from "next/server";
import { z } from "zod";

import { requireMemberApi } from "@/lib/api/require-member";
import { apiError, apiOk } from "@/lib/api/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validation/commerce";
import { updateProduct } from "@/server/services/commerce-service";

/** PATCH /api/products/:id */
export async function PATCH(
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

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  await updateProduct(
    supabase,
    { profileId: auth.session.userId, householdId: auth.session.householdId },
    id,
    parsed.data,
  );
  return apiOk({ id });
}
