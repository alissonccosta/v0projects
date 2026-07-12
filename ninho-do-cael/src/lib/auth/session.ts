import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type SessionInfo =
  | { mode: "demo" }
  | { mode: "unauthenticated" }
  | { mode: "needs_onboarding"; email: string }
  | {
      mode: "member";
      userId: string;
      email: string;
      displayName: string;
      role: "owner" | "collaborator";
      householdId: string;
      householdName: string;
    };

/**
 * Estado de sessão para layouts e páginas de servidor.
 * "demo" = Supabase não configurado (aviso visível, nada de login falso).
 */
export async function getSessionInfo(): Promise<SessionInfo> {
  if (!isSupabaseConfigured()) {
    return { mode: "demo" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { mode: "unauthenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, household_id, households(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { mode: "needs_onboarding", email: user.email ?? "" };
  }

  const household = Array.isArray(profile.households)
    ? profile.households[0]
    : profile.households;

  return {
    mode: "member",
    userId: user.id,
    email: user.email ?? "",
    displayName: profile.display_name,
    role: profile.role,
    householdId: profile.household_id,
    householdName: household?.name ?? "",
  };
}
