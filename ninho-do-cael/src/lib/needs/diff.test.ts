import { describe, expect, it } from "vitest";

import { diffChanges } from "@/lib/needs/diff";

describe("diffChanges (histórico — seção 26)", () => {
  it("registra apenas os campos que mudaram, com antes e depois", () => {
    const changes = diffChanges(
      { title: "Berço", criticality: "alta", unit: null },
      { title: "Berço montessoriano", criticality: "alta", unit: "un" },
    );
    expect(changes).toEqual({
      title: { de: "Berço", para: "Berço montessoriano" },
      unit: { de: null, para: "un" },
    });
  });

  it("trata null e undefined como equivalentes (sem falso positivo)", () => {
    expect(diffChanges({ unit: null }, { unit: undefined })).toEqual({});
  });
});
