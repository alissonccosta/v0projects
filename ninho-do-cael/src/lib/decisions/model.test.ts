import { describe, expect, it } from "vitest";

import {
  DECISION_GROUPS,
  decisionGroupKey,
  groupDecisions,
  isMedicalDecision,
} from "@/lib/decisions/model";
import { DECISION_STATUSES, DECISION_TYPES } from "@/types/domain";

describe("grupos de decisão (seção 21)", () => {
  it("todo status cai em exatamente um grupo", () => {
    for (const status of DECISION_STATUSES) {
      const groups = DECISION_GROUPS.filter((group) =>
        (group.statuses as readonly string[]).includes(status),
      );
      expect(groups, `status ${status}`).toHaveLength(1);
    }
  });

  it("mapeia status ao grupo esperado", () => {
    expect(decisionGroupKey("pendente")).toBe("exigem_acao");
    expect(decisionGroupKey("em_analise")).toBe("exigem_acao");
    expect(decisionGroupKey("aguardando_profissional")).toBe(
      "aguardando_profissional",
    );
    expect(decisionGroupKey("decidida")).toBe("decididas");
    expect(decisionGroupKey("revisar_depois")).toBe("revisar_depois");
    expect(decisionGroupKey("descartada")).toBe("descartadas");
  });

  it("agrupa preservando a ordem dos grupos", () => {
    const grouped = groupDecisions([
      { status: "decidida" as const, id: "a" },
      { status: "pendente" as const, id: "b" },
      { status: "aguardando_profissional" as const, id: "c" },
    ]);
    expect(grouped.map((group) => group.key)).toEqual([
      "exigem_acao",
      "aguardando_profissional",
      "decididas",
      "revisar_depois",
      "descartadas",
    ]);
    expect(grouped[0]?.items.map((item) => item.id)).toEqual(["b"]);
    expect(grouped[2]?.items.map((item) => item.id)).toEqual(["a"]);
  });
});

describe("decisão médica (10.11)", () => {
  it("apenas o tipo medica é médico", () => {
    for (const type of DECISION_TYPES) {
      expect(isMedicalDecision(type)).toBe(type === "medica");
    }
  });
});
