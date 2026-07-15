"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { ActionState } from "@/lib/auth/action-state";
import { getSessionInfo } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decideSchema, decisionSchema } from "@/lib/validation/decisions";
import {
  DecisionNotFoundError,
  DecisionRuleError,
  createDecision,
  decideDecision,
  updateDecision,
} from "@/server/services/decisions-service";

/** Ações de decisões (SDD, seções 21 e 10.11). */

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

function ruleErrorState(error: DecisionRuleError): ActionState {
  return {
    status: "error",
    message: error.field ? "Confira os campos destacados." : error.message,
    fieldErrors: error.field ? { [error.field]: error.message } : undefined,
  };
}

const DECISION_FORM_KEYS = [
  "title",
  "pending_question",
  "type",
  "status",
  "responsible",
  "confidence",
  "due_date",
  "impact",
  "source",
  "rationale",
];

function decisionFormToObject(formData: FormData): Record<string, unknown> {
  const object: Record<string, unknown> = {};
  for (const key of DECISION_FORM_KEYS) {
    object[key] = formData.get(key) ?? undefined;
  }
  object.need_ids = formData
    .getAll("need_ids")
    .map(String)
    .filter((value) => value.length > 0);
  return object;
}

function revalidateDecisions(id?: string, needIds: string[] = []) {
  revalidatePath("/app/decisoes");
  revalidatePath("/app/jornada");
  if (id) revalidatePath(`/app/decisoes/${id}`);
  for (const needId of needIds) {
    revalidatePath(`/app/necessidades/${needId}`);
  }
}

export async function criarDecisao(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = decisionSchema.safeParse(decisionFormToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const row = await createDecision(
    member.context.supabase,
    member.context.actor,
    parsed.data,
  );
  revalidateDecisions(row.id, parsed.data.need_ids);
  redirect(`/app/decisoes/${row.id}`);
}

export async function editarDecisao(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = decisionSchema.safeParse(decisionFormToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await updateDecision(
      member.context.supabase,
      member.context.actor,
      id,
      parsed.data,
    );
  } catch (error) {
    if (error instanceof DecisionNotFoundError) {
      return { status: "error", message: "Decisão não encontrada." };
    }
    if (error instanceof DecisionRuleError) return ruleErrorState(error);
    throw error;
  }
  revalidateDecisions(id, parsed.data.need_ids);
  redirect(`/app/decisoes/${id}`);
}

/** Fluxo Decidir (10.11): conclusão obrigatória; médica exige confirmação. */
export async function decidirDecisao(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const member = await requireMemberContext();
  if (!member.ok) return member.state;

  const parsed = decideSchema.safeParse({
    conclusion: formData.get("conclusion") ?? undefined,
    rationale: formData.get("rationale") ?? undefined,
    source: formData.get("source") ?? undefined,
    confidence: formData.get("confidence") ?? undefined,
    decided_at: formData.get("decided_at") ?? undefined,
    medical_confirmed: formData.get("medical_confirmed") === "on",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await decideDecision(
      member.context.supabase,
      member.context.actor,
      id,
      parsed.data,
    );
  } catch (error) {
    if (error instanceof DecisionNotFoundError) {
      return { status: "error", message: "Decisão não encontrada." };
    }
    if (error instanceof DecisionRuleError) return ruleErrorState(error);
    throw error;
  }
  revalidateDecisions(id);
  return { status: "success", message: "Decisão registrada." };
}
