import type { NextRequest } from "next/server";
import { z } from "zod";

import { requireMemberApi } from "@/lib/api/require-member";
import { apiError, apiOk } from "@/lib/api/result";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  tracking_code: z.string().trim().max(120).optional(),
  expected_delivery_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  notes: z.string().trim().max(2000).optional(),
});

async function parseId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return z.uuid().safeParse(id).success ? id : null;
}

/** GET /api/purchases/:id — detalhe com itens. */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;
  const id = await parseId(context);
  if (!id)
    return apiError("id_invalido", "Identificador inválido.", { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*, purchase_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error)
    return apiError("consulta", "Falha ao carregar a compra.", { status: 500 });
  if (!data)
    return apiError("nao_encontrada", "Compra não encontrada.", {
      status: 404,
    });
  return apiOk(data);
}

/** PATCH /api/purchases/:id — campos operacionais (rastreio, previsão, notas). */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;
  const id = await parseId(context);
  if (!id)
    return apiError("id_invalido", "Identificador inválido.", { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("json_invalido", "Corpo da requisição não é JSON válido.", {
      status: 400,
    });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validacao", "Dados inválidos.", {
      status: 422,
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("purchases")
    .update(parsed.data)
    .eq("id", id);
  if (error)
    return apiError("gravacao", "Falha ao atualizar a compra.", {
      status: 500,
    });
  return apiOk({ id });
}
