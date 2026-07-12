import { describe, expect, it } from "vitest";

import { decideRouteAccess, sanitizeNextPath } from "@/lib/auth/route-guard";

describe("decideRouteAccess", () => {
  it("sem Supabase configurado, nunca bloqueia (modo demonstração)", () => {
    for (const pathname of [
      "/app/dashboard",
      "/onboarding",
      "/convite/x",
      "/login",
    ]) {
      expect(
        decideRouteAccess({
          configured: false,
          authenticated: false,
          pathname,
        }),
      ).toEqual({ action: "next" });
    }
  });

  it("configurado: rotas protegidas exigem sessão e preservam o destino", () => {
    expect(
      decideRouteAccess({
        configured: true,
        authenticated: false,
        pathname: "/app/necessidades",
      }),
    ).toEqual({ action: "redirect", to: "/login?next=%2Fapp%2Fnecessidades" });

    expect(
      decideRouteAccess({
        configured: true,
        authenticated: false,
        pathname: "/onboarding",
      }),
    ).toEqual({ action: "redirect", to: "/login?next=%2Fonboarding" });

    expect(
      decideRouteAccess({
        configured: true,
        authenticated: false,
        pathname: "/convite/abc",
      }),
    ).toEqual({ action: "redirect", to: "/login?next=%2Fconvite%2Fabc" });
  });

  it("configurado e autenticado: acessa rotas protegidas e sai do login", () => {
    expect(
      decideRouteAccess({
        configured: true,
        authenticated: true,
        pathname: "/app/dashboard",
      }),
    ).toEqual({ action: "next" });

    expect(
      decideRouteAccess({
        configured: true,
        authenticated: true,
        pathname: "/login",
      }),
    ).toEqual({ action: "redirect", to: "/app/dashboard" });
  });

  it("login sem sessão continua acessível", () => {
    expect(
      decideRouteAccess({
        configured: true,
        authenticated: false,
        pathname: "/login",
      }),
    ).toEqual({ action: "next" });
  });
});

describe("sanitizeNextPath (proteção contra open redirect)", () => {
  it("aceita apenas caminhos internos", () => {
    expect(sanitizeNextPath("/app/compras")).toBe("/app/compras");
    expect(sanitizeNextPath("https://mal.example")).toBe("/app/dashboard");
    expect(sanitizeNextPath("//mal.example")).toBe("/app/dashboard");
    expect(sanitizeNextPath(null)).toBe("/app/dashboard");
    expect(sanitizeNextPath(undefined)).toBe("/app/dashboard");
  });
});
