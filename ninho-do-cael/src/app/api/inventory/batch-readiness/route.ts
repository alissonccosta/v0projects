import type { NextRequest } from "next/server";

import { requireMemberApi } from "@/lib/api/require-member";
import { apiError, apiOk } from "@/lib/api/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { batchReadinessSchema } from "@/lib/validation/commerce";
import { updateInventoryReadiness } from "@/server/services/commerce-service";

/** POST /api/inventory/batch-readiness — lote de preparo (seção 19). */
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

  const parsed = batchReadinessSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  const count = await updateInventoryReadiness(
    supabase,
    { profileId: auth.session.userId, householdId: auth.session.householdId },
    parsed.data,
  );
  return apiOk({ atualizados: count });
}
