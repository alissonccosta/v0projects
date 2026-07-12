/**
 * Decisão pura de acesso por rota (usada pelo proxy.ts e testada em
 * unidade). Regras (SDD, seção 27):
 *
 * - Sem Supabase configurado, nada é bloqueado: o app roda em modo
 *   demonstração local com aviso visível (seção 46).
 * - Configurado: /app/*, /onboarding e /convite/* exigem sessão;
 *   /login com sessão volta para o painel.
 */

export type GuardResult =
  { action: "next" } | { action: "redirect"; to: string };

export function decideRouteAccess(input: {
  configured: boolean;
  authenticated: boolean;
  pathname: string;
}): GuardResult {
  const { configured, authenticated, pathname } = input;

  if (!configured) {
    return { action: "next" };
  }

  const isProtected =
    pathname === "/onboarding" ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/convite");

  if (isProtected && !authenticated) {
    return {
      action: "redirect",
      to: `/login?next=${encodeURIComponent(pathname)}`,
    };
  }

  if (pathname === "/login" && authenticated) {
    return { action: "redirect", to: "/app/dashboard" };
  }

  return { action: "next" };
}

/** Aceita apenas caminhos internos (evita open redirect — SDD, seção 33). */
export function sanitizeNextPath(next: string | null | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/app/dashboard";
}
