"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { ActionState } from "@/lib/auth/action-state";
import { getSessionInfo } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createNeedSchema,
  updateNeedSchema,
  updateQuantitySchema,
  type UpdateNeedInput,
} from "@/lib/validation/needs";
import { getNeedById } from "@/server/repositories/needs-repository";
import {
  NeedNotFoundError,
  createNeed,
  updateNeed,
} from "@/server/services/needs-service";

/** Ações de necessidade (SDD, seção 16): persistem, registram histórico e
 *  revalidam as telas. As "ações rápidas" mudam apenas o campo prometido. */

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
  for (const [field, messages] of Object.entries(error.flatten().fieldErrors)) {
    const first = (messages as string[] | undefined)?.[0];
    if (first) result[field] = first;
  }
  return result;
}

function revalidateNeeds(id?: string) {
  revalidatePath("/app/necessidades");
  if (id) {
    revalidatePath(`/app/necessidades/${id}`);
  }
}

function formValue(formData: FormData, key: string): FormDataEntryValue | null {
  return formData.get(key);
}

function formToObject(formData: FormData, keys: string[]) {
  const object: Record<string, unknown> = {};
  for (const key of keys) {
    object[key] = formValue(formData, key) ?? undefined;
  }
  return object;
}

const NEED_FORM_KEYS = [
  "title",
  "type",
  "audience",
  "category",
  "phase",
  "criticality",
  "priority",
  "decision_status",
  "acquisition_status",
  "logistics_status",
  "readiness_status",
  "responsible",
  "required_quantity",
  "available_quantity",
  "unit",
  "estimated_price",
  "paid_price",
  "due_date",
  "audit_notes",
];

export async function criarNecessidade(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = createNeedSchema.safeParse(
    formToObject(formData, NEED_FORM_KEYS),
  );
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const row = await createNeed(
    member.context.supabase,
    member.context.actor,
    parsed.data,
  );
  revalidateNeeds();
  redirect(`/app/necessidades/${row.id}`);
}

export async function editarNecessidade(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = updateNeedSchema.safeParse(
    formToObject(formData, NEED_FORM_KEYS),
  );
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await updateNeed(
      member.context.supabase,
      member.context.actor,
      id,
      parsed.data,
    );
  } catch (error) {
    if (error instanceof NeedNotFoundError) {
      return { status: "error", message: "Necessidade não encontrada." };
    }
    throw error;
  }
  revalidateNeeds(id);
  redirect(`/app/necessidades/${id}`);
}

async function patchNeed(
  id: string,
  patch: UpdateNeedInput,
  successMessage: string,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;
  try {
    await updateNeed(member.context.supabase, member.context.actor, id, patch);
  } catch (error) {
    if (error instanceof NeedNotFoundError) {
      return { status: "error", message: "Necessidade não encontrada." };
    }
    return {
      status: "error",
      message: "Não foi possível salvar agora. Tente novamente.",
    };
  }
  revalidateNeeds(id);
  return { status: "success", message: successMessage };
}

/** Marca como comprada; se a logística não estava confirmada, passa a aguardar envio. */
export async function marcarComprada(id: string): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;
  const before = await getNeedById(member.context.supabase, id);
  if (!before) {
    return { status: "error", message: "Necessidade não encontrada." };
  }
  const patch: UpdateNeedInput = { acquisition_status: "comprado" };
  if (before.logistics_status === "nao_confirmado") {
    patch.logistics_status = "aguardando_envio";
  }
  return patchNeed(id, patch, "Marcada como comprada.");
}

export async function confirmarEntrega(id: string): Promise<ActionState> {
  return patchNeed(
    id,
    { logistics_status: "entregue" },
    "Entrega confirmada. Ajuste o preparo se for preciso lavar ou montar.",
  );
}

export async function marcarPronta(id: string): Promise<ActionState> {
  return patchNeed(
    id,
    { readiness_status: "pronto_para_uso" },
    "Marcada como pronta para uso.",
  );
}

export async function atualizarQuantidade(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updateQuantitySchema.safeParse({
    available_quantity: formValue(formData, "available_quantity"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }
  return patchNeed(
    id,
    { available_quantity: parsed.data.available_quantity },
    "Quantidade atualizada.",
  );
}

export async function arquivarNecessidade(id: string): Promise<ActionState> {
  return patchNeed(id, { arquivada: true }, "Necessidade arquivada.");
}

export async function restaurarNecessidade(id: string): Promise<ActionState> {
  return patchNeed(id, { arquivada: false }, "Necessidade restaurada.");
}
