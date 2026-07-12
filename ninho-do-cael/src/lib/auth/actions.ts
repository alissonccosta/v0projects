"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { sanitizeNextPath } from "@/lib/auth/route-guard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/auth/action-state";
import {
  acceptInviteSchema,
  createInviteSchema,
  loginSchema,
  onboardingSchema,
} from "@/lib/validation/auth";

function firstFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) {
      result[field] = messages[0];
    }
  }
  return result;
}

async function getAppUrl(): Promise<string> {
  const configured = process.env.APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  const headerStore = await headers();
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  return `${proto}://${host ?? "localhost:3000"}`;
}

/** Envia o magic link (SDD, seção 27). */
export async function sendMagicLink(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "Autenticação indisponível: o Supabase ainda não foi configurado.",
    };
  }

  const parsed = loginSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const nextPath = sanitizeNextPath(formData.get("next")?.toString());
  const appUrl = await getAppUrl();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${appUrl}/auth/confirm?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        error.status === 429
          ? "Muitas tentativas em sequência. Aguarde um minuto e tente de novo."
          : "Não foi possível enviar o link agora. Tente novamente.",
    };
  }

  return {
    status: "success",
    message: `Enviamos um link de acesso para ${parsed.data.email}.`,
    data: { email: parsed.data.email },
  };
}

/** Encerra a sessão. */
export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

/** Owner confirma família e Cael no primeiro acesso (SDD, seção 27). */
export async function completeOnboarding(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Supabase não configurado." };
  }

  const parsed = onboardingSchema.safeParse({
    householdName: formData.get("householdName"),
    displayName: formData.get("displayName"),
    babyName: formData.get("babyName"),
    dueDate: formData.get("dueDate") ?? "",
    birthType: formData.get("birthType") ?? undefined,
    maternity: formData.get("maternity") ?? undefined,
    city: formData.get("city") ?? undefined,
    state: formData.get("state") ?? undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("create_household_with_baby", {
    p_household_name: parsed.data.householdName,
    p_display_name: parsed.data.displayName,
    p_baby_name: parsed.data.babyName,
    p_due_date: parsed.data.dueDate ?? null,
    p_birth_type: parsed.data.birthType ?? null,
    p_maternity: parsed.data.maternity ?? null,
    p_city: parsed.data.city ?? null,
    p_state: parsed.data.state ?? null,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  redirect("/app/dashboard");
}

/** Colaboradora aceita o convite (SDD, seção 27). */
export async function acceptInvite(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Supabase não configurado." };
  }

  const parsed = acceptInviteSchema.safeParse({
    displayName: formData.get("displayName"),
    token: formData.get("token"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("accept_household_invite", {
    p_token: parsed.data.token,
    p_display_name: parsed.data.displayName,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  redirect("/app/dashboard");
}

/** Owner cria um convite e recebe o link para compartilhar. */
export async function createInvite(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Supabase não configurado." };
  }

  const parsed = createInviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Sessão expirada. Entre novamente." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("household_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return { status: "error", message: "Perfil não encontrado." };
  }

  const { data: invite, error } = await supabase
    .from("household_invites")
    .insert({
      household_id: profile.household_id,
      email: parsed.data.email,
      invited_by: user.id,
    })
    .select("token")
    .single();

  if (error || !invite) {
    return {
      status: "error",
      message:
        "Não foi possível criar o convite. Apenas quem administra o Ninho pode convidar.",
    };
  }

  const appUrl = await getAppUrl();
  revalidatePath("/app/configuracoes/familia");
  return {
    status: "success",
    message: `Convite criado para ${parsed.data.email}.`,
    data: { link: `${appUrl}/convite/${invite.token}` },
  };
}

/** Owner revoga um convite pendente. */
export async function revokeInvite(inviteId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("household_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", inviteId)
    .is("accepted_at", null);
  revalidatePath("/app/configuracoes/familia");
}
