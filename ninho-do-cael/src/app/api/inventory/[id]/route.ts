import type { NextRequest } from "next/server";
import { z } from "zod";

import { requireMemberApi } from "@/lib/api/require-member";
import { apiError, apiOk } from "@/lib/api/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { inventoryPatchSchema } from "@/lib/validation/commerce";
import { updateInventoryReadiness } from "@/server/services/commerce-service";

/** PATCH /api/inventory/:id — atualiza campos do item de estoque. */
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

  const parsed = inventoryPatchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  const actor = {
    profileId: auth.session.userId,
    householdId: auth.session.householdId,
  };

  const { readiness_status, ...fields } = parsed.data;
  if (Object.keys(fields).length > 0) {
    const { error } = await supabase
      .from("inventory_items")
      .update(fields)
      .eq("id", id);
    if (error) {
      return apiError("gravacao", "Falha ao atualizar o item.", {
        status: 500,
      });
    }
  }
  if (readiness_status) {
    await updateInventoryReadiness(supabase, actor, {
      item_ids: [id],
      readiness_status,
    });
  }
  return apiOk({ id });
}
