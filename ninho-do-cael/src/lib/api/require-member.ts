import { apiError } from "@/lib/api/result";
import { getSessionInfo, type SessionInfo } from "@/lib/auth/session";

type MemberSession = Extract<SessionInfo, { mode: "member" }>;

/** Guarda comum das rotas de API internas (seção 29). */
export async function requireMemberApi(): Promise<
  { session: MemberSession } | { error: ReturnType<typeof apiError> }
> {
  const session = await getSessionInfo();
  if (session.mode === "demo") {
    return {
      error: apiError(
        "nao_configurado",
        "Supabase não configurado neste ambiente (veja docs/setup-supabase.md).",
        { status: 503 },
      ),
    };
  }
  if (session.mode !== "member") {
    return {
      error: apiError("nao_autenticado", "É preciso estar autenticado.", {
        status: 401,
      }),
    };
  }
  return { session };
}
