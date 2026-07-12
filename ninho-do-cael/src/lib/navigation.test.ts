import { describe, expect, it } from "vitest";

import {
  MOBILE_NAV,
  MODULES,
  MORE_NAV,
  PRIMARY_NAV,
  findModuleByPathname,
} from "@/lib/navigation";

describe("navegação (SDD, seção 11)", () => {
  it("sidebar segue a ordem da seção 11.2", () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      "Início",
      "Necessidades",
      "Compras",
      "Estoque",
      "Tarefas",
      "Decisões",
      "Jornada",
      "Orçamento",
      "Configurações",
    ]);
  });

  it("barra inferior mobile tem os 4 itens da seção 11.3 (Mais é o quinto)", () => {
    expect(MOBILE_NAV.map((item) => item.label)).toEqual([
      "Início",
      "Necessidades",
      "Tarefas",
      "Compras",
    ]);
  });

  it("folha Mais contém exatamente as seções da 11.3", () => {
    expect(MORE_NAV.map((item) => item.label)).toEqual([
      "Estoque",
      "Decisões",
      "Jornada",
      "Orçamento",
      "Configurações",
    ]);
  });

  it("todas as rotas são únicas e vivem sob /app/ (seção 11.1)", () => {
    const hrefs = Object.values(MODULES).map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/app\/[a-z-]+$/);
    }
  });

  it("resolve o módulo ativo a partir do pathname, incluindo subrotas", () => {
    expect(findModuleByPathname("/app/necessidades")?.key).toBe("necessidades");
    expect(findModuleByPathname("/app/necessidades/abc-123")?.key).toBe(
      "necessidades",
    );
    expect(findModuleByPathname("/app/desconhecido")).toBeUndefined();
  });
});
