// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startTestDb, type TestDb } from "./helpers/test-db";

/**
 * Regras da Fase 5 no banco real: conclusão de tarefa exige data, decisão
 * médica não vira "decidida" sem conclusão (10.11) e vínculos
 * necessidade↔tarefa/decisão não duplicam.
 */

const USER = "a0000000-0000-4000-8000-0000000000aa";

let db: TestDb;
let householdId: string;
let needId: string;

beforeAll(async () => {
  db = await startTestDb();
  await db.createAuthUser(USER, "fase5@ninho.local");
  const created = await db.asUser(USER, async (client) => {
    const { rows } = await client.query(
      `select public.create_household_with_baby(
         'Ninho Teste', 'Alisson', 'Cael', '2026-11-15'::date
       ) as household_id`,
    );
    return rows[0].household_id as string;
  });
  householdId = created;
  needId = await db.asUser(USER, async (client) => {
    const { rows } = await client.query(
      `insert into public.needs (household_id, title, category)
       values ($1, 'Termômetro', 'higiene') returning id`,
      [householdId],
    );
    return rows[0].id as string;
  });
}, 240_000);

afterAll(async () => {
  await db?.stop();
}, 60_000);

describe("tarefas (seção 20)", () => {
  it("concluída sem completed_at é rejeitada pelo banco", async () => {
    await expect(
      db.asUser(USER, (client) =>
        client.query(
          `insert into public.tasks (household_id, title, status)
           values ($1, 'Inválida', 'concluida')`,
          [householdId],
        ),
      ),
    ).rejects.toThrow(/tasks_concluida_tem_data/);
  });

  it("aceita conclusão com data, custo real e referência", async () => {
    await db.asUser(USER, async (client) => {
      const { rows } = await client.query(
        `insert into public.tasks
           (household_id, title, status, completed_at, actual_cost, completion_reference)
         values ($1, 'Lavar roupas', 'concluida', now(), 35.90, 'https://exemplo.com')
         returning completion_reference`,
        [householdId],
      );
      expect(rows[0].completion_reference).toBe("https://exemplo.com");
    });
  });

  it("vínculo tarefa↔necessidade não duplica", async () => {
    const taskId = await db.asUser(USER, async (client) => {
      const { rows } = await client.query(
        `insert into public.tasks (household_id, title)
         values ($1, 'Comprar termômetro') returning id`,
        [householdId],
      );
      await client.query(
        `insert into public.need_tasks (household_id, need_id, task_id)
         values ($1, $2, $3)`,
        [householdId, needId, rows[0].id],
      );
      return rows[0].id as string;
    });
    await expect(
      db.asUser(USER, (client) =>
        client.query(
          `insert into public.need_tasks (household_id, need_id, task_id)
           values ($1, $2, $3)`,
          [householdId, needId, taskId],
        ),
      ),
    ).rejects.toThrow(/need_tasks_need_id_task_id_key|duplicate key/);
  });
});

describe("decisões médicas (seção 10.11)", () => {
  it("médica não vira decidida sem conclusão registrada", async () => {
    await expect(
      db.asUser(USER, (client) =>
        client.query(
          `insert into public.decisions (household_id, title, type, status)
           values ($1, 'Qual vacina?', 'medica', 'decidida')`,
          [householdId],
        ),
      ),
    ).rejects.toThrow(/decisao_medica_exige_conclusao/);
  });

  it("médica com conclusão registrada é aceita", async () => {
    await db.asUser(USER, async (client) => {
      const { rows } = await client.query(
        `insert into public.decisions
           (household_id, title, type, status, conclusion, decided_at)
         values ($1, 'Qual vacina?', 'medica', 'decidida',
                 'Seguir o calendário indicado pela pediatra.', current_date)
         returning id`,
        [householdId],
      );
      expect(rows[0].id).toBeTruthy();
    });
  });

  it("não médica pode ser decidida (constraint só restringe médicas)", async () => {
    await db.asUser(USER, async (client) => {
      const { rows } = await client.query(
        `insert into public.decisions
           (household_id, title, type, status, conclusion, decided_at)
         values ($1, 'Cor do quarto', 'familiar', 'decidida', 'Verde sálvia.', current_date)
         returning id`,
        [householdId],
      );
      expect(rows[0].id).toBeTruthy();
    });
  });

  it("vínculo decisão↔necessidade não duplica", async () => {
    const decisionId = await db.asUser(USER, async (client) => {
      const { rows } = await client.query(
        `insert into public.decisions (household_id, title)
         values ($1, 'Qual marca?') returning id`,
        [householdId],
      );
      await client.query(
        `insert into public.need_decisions (household_id, need_id, decision_id)
         values ($1, $2, $3)`,
        [householdId, needId, rows[0].id],
      );
      return rows[0].id as string;
    });
    await expect(
      db.asUser(USER, (client) =>
        client.query(
          `insert into public.need_decisions (household_id, need_id, decision_id)
           values ($1, $2, $3)`,
          [householdId, needId, decisionId],
        ),
      ),
    ).rejects.toThrow(/need_decisions_need_id_decision_id_key|duplicate key/);
  });
});
