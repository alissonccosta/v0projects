import { describe, expect, it } from "vitest";

import {
  groupSearchResults,
  searchDocs,
  type SearchDoc,
} from "@/lib/search/model";

function doc(partial: Partial<SearchDoc> & { id: string }): SearchDoc {
  return {
    entity: "necessidade",
    title: partial.id,
    subtitle: null,
    href: `/x/${partial.id}`,
    ...partial,
  };
}

describe("searchDocs (seção 24)", () => {
  it("ignora acentos nos dois lados", () => {
    const results = searchDocs(
      [doc({ id: "a", title: "Térmometro de banho" })],
      "termometro",
    );
    expect(results).toHaveLength(1);
  });

  it("prioriza título que começa com o termo, depois contém, depois subtítulo", () => {
    const results = searchDocs(
      [
        doc({
          id: "sub",
          title: "Outro nome",
          subtitle: "berço montessoriano",
        }),
        doc({ id: "contem", title: "Mini berço" }),
        doc({ id: "comeca", title: "Berço do Cael" }),
      ],
      "berço",
    );
    expect(results.map((r) => r.id)).toEqual(["comeca", "contem", "sub"]);
    expect(results.map((r) => r.rank)).toEqual([0, 1, 2]);
  });

  it("termo vazio não retorna nada e o limite corta", () => {
    expect(searchDocs([doc({ id: "a" })], "  ")).toHaveLength(0);
    const many = Array.from({ length: 20 }, (_, i) =>
      doc({ id: `t${i}`, title: `Fralda ${i}` }),
    );
    expect(searchDocs(many, "fralda", 5)).toHaveLength(5);
  });

  it("agrupa preservando a ordem das entidades", () => {
    const results = searchDocs(
      [
        doc({ id: "d", entity: "decisao", title: "Fralda ecológica?" }),
        doc({ id: "n", entity: "necessidade", title: "Fraldas P" }),
        doc({ id: "c", entity: "compra", title: "Fraldas do chá" }),
      ],
      "fralda",
    );
    const groups = groupSearchResults(results);
    expect(groups.map((g) => g.entity)).toEqual([
      "necessidade",
      "compra",
      "decisao",
    ]);
    expect(groups[0]?.label).toBe("Necessidades");
  });
});
