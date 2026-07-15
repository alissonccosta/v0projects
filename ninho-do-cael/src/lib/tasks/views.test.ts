import { describe, expect, it } from "vitest";

import {
  blockedInfo,
  buildBeforeBirthView,
  buildCalendarMonth,
  buildWeekView,
  compareTasks,
  isTaskOverdue,
  parseCalendarMonth,
  parseTaskView,
  tasksByDate,
  groupTasksByResponsible,
  groupTasksByStatus,
  weekRange,
  type TaskItem,
} from "@/lib/tasks/views";

function task(partial: Partial<TaskItem> & { id: string }): TaskItem {
  return {
    title: partial.id,
    type: "tarefa",
    category: null,
    status: "planejada",
    responsible: "casal",
    dueDate: null,
    windowStart: null,
    windowEnd: null,
    estimatedCost: null,
    actualCost: null,
    dependsOnTaskId: null,
    blockedReason: null,
    completionCriteria: null,
    completedAt: null,
    needs: [],
    createdAt: "2026-07-01T00:00:00Z",
    ...partial,
  };
}

describe("parseTaskView / parseCalendarMonth", () => {
  it("aceita visões conhecidas e cai em semana", () => {
    expect(parseTaskView("bloqueadas")).toBe("bloqueadas");
    expect(parseTaskView("inexistente")).toBe("semana");
    expect(parseTaskView(undefined)).toBe("semana");
  });

  it("valida o mês do calendário", () => {
    expect(parseCalendarMonth("2026-11", "2026-07-15")).toBe("2026-11");
    expect(parseCalendarMonth("2026-13", "2026-07-15")).toBe("2026-07");
    expect(parseCalendarMonth(undefined, "2026-07-15")).toBe("2026-07");
  });
});

describe("weekRange", () => {
  it("vai de segunda a domingo", () => {
    // 2026-07-15 é quarta-feira.
    expect(weekRange("2026-07-15")).toEqual({
      start: "2026-07-13",
      end: "2026-07-19",
    });
  });

  it("domingo pertence à semana que começou na segunda anterior", () => {
    expect(weekRange("2026-07-19")).toEqual({
      start: "2026-07-13",
      end: "2026-07-19",
    });
  });
});

describe("isTaskOverdue / compareTasks", () => {
  it("vencida apenas se ativa e com prazo passado", () => {
    const today = "2026-07-15";
    expect(isTaskOverdue(task({ id: "a", dueDate: "2026-07-14" }), today)).toBe(
      true,
    );
    expect(isTaskOverdue(task({ id: "b", dueDate: "2026-07-15" }), today)).toBe(
      false,
    );
    expect(
      isTaskOverdue(
        task({ id: "c", dueDate: "2026-07-01", status: "concluida" }),
        today,
      ),
    ).toBe(false);
    expect(isTaskOverdue(task({ id: "d" }), today)).toBe(false);
  });

  it("ordena por prazo com nulos por último", () => {
    const a = task({ id: "a", dueDate: "2026-07-20" });
    const b = task({ id: "b", dueDate: "2026-07-18" });
    const c = task({ id: "c", createdAt: "2026-06-01T00:00:00Z" });
    expect([a, b, c].sort(compareTasks).map((t) => t.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
  });
});

describe("buildWeekView", () => {
  const today = "2026-07-15";

  it("separa atrasadas, dias da semana e sem prazo", () => {
    const tasks = [
      task({ id: "atrasada", dueDate: "2026-07-10" }),
      task({ id: "hoje", dueDate: "2026-07-15" }),
      task({ id: "domingo", dueDate: "2026-07-19" }),
      task({ id: "fora", dueDate: "2026-07-25" }),
      task({ id: "sem-prazo" }),
      task({ id: "feita-sem-prazo", status: "concluida" }),
    ];
    const view = buildWeekView(tasks, today);
    expect(view.overdue.map((t) => t.id)).toEqual(["atrasada"]);
    expect(view.days).toHaveLength(7);
    expect(view.days[2]?.tasks.map((t) => t.id)).toEqual(["hoje"]);
    expect(view.days[6]?.tasks.map((t) => t.id)).toEqual(["domingo"]);
    expect(view.undated.map((t) => t.id)).toEqual(["sem-prazo"]);
  });

  it("tarefa concluída com prazo passado não é atrasada", () => {
    const view = buildWeekView(
      [task({ id: "ok", dueDate: "2026-07-01", status: "concluida" })],
      today,
    );
    expect(view.overdue).toHaveLength(0);
  });
});

describe("buildCalendarMonth", () => {
  it("cobre o mês com semanas de segunda a domingo", () => {
    const calendar = buildCalendarMonth("2026-07");
    // Julho/2026 começa numa quarta: a grade abre em 29/06 (segunda).
    expect(calendar.weeks[0]?.[0]).toEqual({
      date: "2026-06-29",
      inMonth: false,
    });
    expect(calendar.weeks.at(-1)?.at(-1)?.date).toBe("2026-08-02");
    expect(calendar.previous).toBe("2026-06");
    expect(calendar.next).toBe("2026-08");
    const days = calendar.weeks.flat();
    expect(days.filter((day) => day.inMonth)).toHaveLength(31);
    for (const week of calendar.weeks) {
      expect(week).toHaveLength(7);
    }
  });

  it("indexa tarefas por dia", () => {
    const map = tasksByDate([
      task({ id: "a", dueDate: "2026-07-15" }),
      task({ id: "b", dueDate: "2026-07-15" }),
      task({ id: "c" }),
    ]);
    expect(map.get("2026-07-15")?.map((t) => t.id)).toEqual(["a", "b"]);
    expect(map.size).toBe(1);
  });
});

describe("agrupamentos", () => {
  it("por status na ordem do enum, omitindo vazios", () => {
    const groups = groupTasksByStatus([
      task({ id: "a", status: "concluida", completedAt: "2026-07-01" }),
      task({ id: "b", status: "planejada" }),
    ]);
    expect(groups.map((g) => g.status)).toEqual(["planejada", "concluida"]);
  });

  it("por responsável na ordem do domínio", () => {
    const groups = groupTasksByResponsible([
      task({ id: "a", responsible: "pai" }),
      task({ id: "b", responsible: "mae" }),
    ]);
    expect(groups.map((g) => g.responsible)).toEqual(["mae", "pai"]);
  });
});

describe("blockedInfo (seção 20)", () => {
  it("com dependência pendente, a ação é concluí-la (responsável dela)", () => {
    const info = blockedInfo(
      { blockedReason: "Berço ainda não chegou", responsible: "casal" },
      {
        id: "d",
        title: "Receber o berço",
        status: "planejada",
        responsible: "pai",
      },
    );
    expect(info.dependencyTitle).toBe("Receber o berço");
    expect(info.dependencyDone).toBe(false);
    expect(info.blocker).toBe("Berço ainda não chegou");
    expect(info.action).toBe("Concluir “Receber o berço”");
    expect(info.actionResponsible).toBe("pai");
  });

  it("com dependência concluída, sugere retomar", () => {
    const info = blockedInfo(
      { blockedReason: null, responsible: "mae" },
      {
        id: "d",
        title: "Receber o berço",
        status: "concluida",
        responsible: "pai",
      },
    );
    expect(info.dependencyDone).toBe(true);
    expect(info.action).toMatch(/retome/i);
  });

  it("sem dependência, deriva a ação do bloqueador", () => {
    const info = blockedInfo(
      { blockedReason: "Aguardando reembolso", responsible: "mae" },
      null,
    );
    expect(info.action).toBe("Resolver: Aguardando reembolso");
    expect(info.actionResponsible).toBe("mae");
  });
});

describe("buildBeforeBirthView", () => {
  it("filtra ativas com prazo até a data prevista e conta os dias", () => {
    const view = buildBeforeBirthView(
      [
        task({ id: "antes", dueDate: "2026-11-10" }),
        task({ id: "no-dia", dueDate: "2026-11-15" }),
        task({ id: "depois", dueDate: "2026-12-01" }),
        task({
          id: "feita",
          dueDate: "2026-10-01",
          status: "concluida",
        }),
        task({ id: "sem-prazo" }),
      ],
      "2026-11-15",
      "2026-07-15",
    );
    expect(view.tasks.map((t) => t.id)).toEqual(["antes", "no-dia"]);
    expect(view.daysUntilBirth).toBe(123);
  });
});
