import { describe, expect, it } from "vitest";

import {
  buildJourney,
  isFuturePhase,
  phaseForDate,
  phaseForLinked,
  phaseMilestone,
  phaseWindow,
} from "@/lib/journey/model";

const BIRTH = "2026-11-15";
const TODAY = "2026-07-15";

describe("phaseWindow / phaseMilestone", () => {
  it("calcula janelas a partir da data prevista", () => {
    expect(phaseWindow("antes_do_parto", BIRTH)).toEqual({
      start: null,
      end: BIRTH,
    });
    expect(phaseWindow("meses_0_3", BIRTH)).toEqual({
      start: "2026-11-15",
      end: "2027-02-15",
    });
    expect(phaseWindow("meses_3_6", BIRTH)).toEqual({
      start: "2027-02-15",
      end: "2027-05-15",
    });
    expect(phaseWindow("meses_6_12", BIRTH)).toEqual({
      start: "2027-05-15",
      end: "2027-11-15",
    });
    expect(phaseWindow("apos_12_meses", BIRTH)).toEqual({
      start: "2027-11-15",
      end: null,
    });
    expect(phaseWindow("continuo", BIRTH)).toEqual({ start: null, end: null });
  });

  it("marcos citam datas derivadas, nunca fixas", () => {
    expect(phaseMilestone("antes_do_parto", BIRTH)).toContain("15/11/2026");
    expect(phaseMilestone("meses_0_3", BIRTH)).toContain("15/02/2027");
    expect(phaseMilestone("apos_12_meses", BIRTH)).toContain("15/11/2027");
  });
});

describe("isFuturePhase", () => {
  it("antes do parto e contínuo nunca são futuras", () => {
    expect(isFuturePhase("antes_do_parto", BIRTH, TODAY)).toBe(false);
    expect(isFuturePhase("continuo", BIRTH, TODAY)).toBe(false);
  });

  it("fases pós-nascimento são futuras antes do parto", () => {
    expect(isFuturePhase("meses_0_3", BIRTH, TODAY)).toBe(true);
    expect(isFuturePhase("apos_12_meses", BIRTH, TODAY)).toBe(true);
  });

  it("depois do nascimento, 0–3 vira corrente", () => {
    expect(isFuturePhase("meses_0_3", BIRTH, "2026-11-20")).toBe(false);
    expect(isFuturePhase("meses_3_6", BIRTH, "2026-11-20")).toBe(true);
  });
});

describe("phaseForDate / phaseForLinked (D-035)", () => {
  it("fronteiras: dia anterior é antes do parto; o dia do parto é 0–3", () => {
    expect(phaseForDate("2026-11-14", BIRTH)).toBe("antes_do_parto");
    expect(phaseForDate("2026-11-15", BIRTH)).toBe("meses_0_3");
    expect(phaseForDate("2027-02-15", BIRTH)).toBe("meses_3_6");
    expect(phaseForDate("2027-11-15", BIRTH)).toBe("apos_12_meses");
  });

  it("prioriza a fase mais cedo das necessidades vinculadas", () => {
    expect(
      phaseForLinked(["meses_3_6", "antes_do_parto"], "2027-01-01", BIRTH),
    ).toBe("antes_do_parto");
    expect(phaseForLinked(["continuo", "meses_0_3"], null, BIRTH)).toBe(
      "meses_0_3",
    );
  });

  it("sem vínculo usa o prazo; sem prazo, contínuo", () => {
    expect(phaseForLinked([], "2026-10-01", BIRTH)).toBe("antes_do_parto");
    expect(phaseForLinked([], null, BIRTH)).toBe("continuo");
  });
});

describe("buildJourney", () => {
  it("agrega necessidades, tarefas, decisões e gasto por fase", () => {
    const journey = buildJourney({
      needs: [
        {
          phase: "antes_do_parto",
          criticality: "critica",
          readiness: 1,
          archived: false,
        },
        {
          phase: "antes_do_parto",
          criticality: "baixa",
          readiness: 0.5,
          archived: false,
        },
        {
          phase: "antes_do_parto",
          criticality: "alta",
          readiness: 0,
          archived: true,
        },
        {
          phase: "meses_0_3",
          criticality: "media",
          readiness: 0.2,
          archived: false,
        },
      ],
      tasks: [
        { phase: "antes_do_parto", status: "concluida", dueDate: null },
        { phase: "antes_do_parto", status: "bloqueada", dueDate: "2026-07-01" },
        { phase: "continuo", status: "planejada", dueDate: null },
      ],
      decisions: [
        { phase: "antes_do_parto", status: "decidida" },
        { phase: "antes_do_parto", status: "aguardando_profissional" },
      ],
      purchases: [
        {
          status: "entregue",
          total: 100,
          returnedAmount: 10,
          items: [
            { allocatedTotal: 60, phase: "antes_do_parto" },
            { allocatedTotal: 40, phase: null },
          ],
        },
        {
          status: "cancelada",
          total: 50,
          returnedAmount: 0,
          items: [{ allocatedTotal: 50, phase: "antes_do_parto" }],
        },
      ],
      birthDate: BIRTH,
      today: TODAY,
    });

    const antes = journey.phases.find((p) => p.phase === "antes_do_parto")!;
    // Arquivada fica de fora; prontidão ponderada: (1*5 + 0.5*1) / 6.
    expect(antes.needs.total).toBe(2);
    expect(antes.needs.ready).toBe(1);
    expect(antes.needs.readiness).toBeCloseTo(5.5 / 6, 4);
    expect(antes.tasks).toEqual({
      total: 2,
      done: 1,
      blocked: 1,
      overdue: 1,
    });
    expect(antes.decisions).toEqual({
      total: 2,
      decided: 1,
      awaitingProfessional: 1,
    });
    // Devolução de R$10 rateada 60/40: 6 na fase, 4 no sem-vínculo.
    expect(antes.purchases).toEqual({ count: 1, spent: 54 });
    expect(journey.unassignedSpent).toBe(36);

    const continuo = journey.phases.find((p) => p.phase === "continuo")!;
    expect(continuo.tasks.total).toBe(1);
    expect(continuo.needs.readiness).toBe(0);
    expect(journey.phases.map((p) => p.phase)).toHaveLength(6);
  });
});
