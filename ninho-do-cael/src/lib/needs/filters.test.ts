import { describe, expect, it } from "vitest";

import {
  DEFAULT_FILTERS,
  compareNeeds,
  countActiveFilters,
  needMatchesFilters,
  normalizeSearchText,
  parseNeedFilters,
  serializeNeedFilters,
  type FilterableNeed,
} from "@/lib/needs/filters";

function makeNeed(overrides: Partial<FilterableNeed> = {}): FilterableNeed {
  return {
    id: "n1",
    title: "Berço montessoriano",
    category: "sono",
    phase: "antes_do_parto",
    criticality: "critica",
    responsible: "casal",
    dueDate: null,
    archivedAt: null,
    decisionStatus: "escolhido",
    acquisitionStatus: "comprado",
    logisticsStatus: "entregue",
    readinessStatus: "precisa_montar",
    requiredQuantity: 1,
    availableQuantity: 1,
    ...overrides,
  };
}

describe("parse/serialize dos filtros (URL preserva estado — seção 16)", () => {
  it("faz o ciclo completo sem perder informação", () => {
    const filters = parseNeedFilters({
      q: "berço",
      categoria: "sono",
      criticidade: "critica",
      antesDoParto: "1",
      visao: "categoria",
    });
    const query = serializeNeedFilters(filters);
    const reparsed = parseNeedFilters(
      Object.fromEntries(new URLSearchParams(query)),
    );
    expect(reparsed).toEqual(filters);
  });

  it("valores inválidos caem no padrão sem derrubar os válidos", () => {
    const filters = parseNeedFilters({
      categoria: "inexistente",
      fase: "meses_0_3",
    });
    expect(filters.categoria).toBeUndefined();
    expect(filters.fase).toBe("meses_0_3");
  });

  it("padrões não poluem a URL", () => {
    expect(serializeNeedFilters(DEFAULT_FILTERS)).toBe("");
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
  });
});

describe("busca ignora acentos (seções 16 e 24)", () => {
  it("normaliza acentos e caixa", () => {
    expect(normalizeSearchText("Berço")).toBe("berco");
    expect(normalizeSearchText("HIGIENIZAÇÃO")).toBe("higienizacao");
  });

  it("encontra 'berco' em 'Berço montessoriano'", () => {
    const need = makeNeed();
    expect(needMatchesFilters(need, { ...DEFAULT_FILTERS, q: "berco" })).toBe(
      true,
    );
    expect(needMatchesFilters(need, { ...DEFAULT_FILTERS, q: "fralda" })).toBe(
      false,
    );
  });
});

describe("filtros combinam (seção 16)", () => {
  it("todas as dimensões restringem em conjunto", () => {
    const need = makeNeed();
    expect(
      needMatchesFilters(need, {
        ...DEFAULT_FILTERS,
        categoria: "sono",
        criticidade: "critica",
        aquisicao: "comprado",
        prontidao: "precisa_montar",
        antesDoParto: true,
      }),
    ).toBe(true);
    expect(
      needMatchesFilters(need, {
        ...DEFAULT_FILTERS,
        categoria: "sono",
        criticidade: "baixa",
      }),
    ).toBe(false);
  });

  it("somente pendências exclui itens 100% prontos e descartados", () => {
    const pronto = makeNeed({
      readinessStatus: "pronto_para_uso",
    });
    const pendente = makeNeed();
    const descartado = makeNeed({ decisionStatus: "descartado" });
    const filters = { ...DEFAULT_FILTERS, somentePendencias: true };
    expect(needMatchesFilters(pronto, filters)).toBe(false);
    expect(needMatchesFilters(pendente, filters)).toBe(true);
    expect(needMatchesFilters(descartado, filters)).toBe(false);
  });

  it("arquivadas ficam fora por padrão e aparecem sob demanda", () => {
    const arquivada = makeNeed({ archivedAt: "2026-07-01T00:00:00Z" });
    expect(needMatchesFilters(arquivada, DEFAULT_FILTERS)).toBe(false);
    expect(
      needMatchesFilters(arquivada, { ...DEFAULT_FILTERS, arquivadas: true }),
    ).toBe(true);
  });
});

describe("ordenação padrão", () => {
  it("crítica antes de baixa; prazo mais próximo antes; sem prazo por último", () => {
    const list = [
      makeNeed({ id: "a", criticality: "baixa", title: "A" }),
      makeNeed({ id: "b", criticality: "critica", dueDate: null, title: "B" }),
      makeNeed({
        id: "c",
        criticality: "critica",
        dueDate: "2026-10-01",
        title: "C",
      }),
      makeNeed({
        id: "d",
        criticality: "critica",
        dueDate: "2026-09-01",
        title: "D",
      }),
    ].sort(compareNeeds);
    expect(list.map((need) => need.id)).toEqual(["d", "c", "b", "a"]);
  });
});
