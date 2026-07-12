// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startTestDb, type TestDb } from "./helpers/test-db";

/**
 * Prova, contra um Postgres real, o modelo de autorização da seção 4 do SDD:
 * isolamento por household, papéis owner/collaborator e as RPCs de entrada.
 */

const ALISSON = "11111111-1111-4111-8111-111111111111";
const DUDA = "22222222-2222-4222-8222-222222222222";
const VIZINHA = "33333333-3333-4333-8333-333333333333";
const CONVIDADA_EXPIRADA = "44444444-4444-4444-8444-444444444444";
const CONVIDADA_REPETIDA = "55555555-5555-4555-8555-555555555555";

let db: TestDb;
let casa1: string;
let needCasa1: string;

beforeAll(async () => {
  db = await startTestDb();

  await db.createAuthUser(ALISSON, "alisson@teste.local");
  await db.createAuthUser(DUDA, "duda@teste.local");
  await db.createAuthUser(VIZINHA, "vizinha@teste.local");
  await db.createAuthUser(CONVIDADA_EXPIRADA, "expirada@teste.local");
  await db.createAuthUser(CONVIDADA_REPETIDA, "repetida@teste.local");

  casa1 = await db.asUser(ALISSON, async (client) => {
    const result = await client.query(
      `select public.create_household_with_baby(
         'Ninho do Cael', 'Alisson', 'Cael',
         '2026-11-15', 'Cesárea', 'Santa Luiza / Unimed', 'Itajaí', 'SC'
       ) as id`,
    );
    return result.rows[0].id as string;
  });

  // Segunda casa, para provar o isolamento.
  await db.asUser(VIZINHA, async (client) => {
    await client.query(
      `select public.create_household_with_baby('Casa Vizinha', 'Vizinha', 'Outro Bebê')`,
    );
  });

  // Alisson (owner) convida a Duda; ela aceita pelo token.
  const token = await db.asUser(ALISSON, async (client) => {
    const result = await client.query(
      `insert into public.household_invites (household_id, email, invited_by)
       values ($1, 'duda@teste.local', $2) returning token`,
      [casa1, ALISSON],
    );
    return result.rows[0].token as string;
  });

  await db.asUser(DUDA, async (client) => {
    await client.query(`select public.accept_household_invite($1, 'Duda')`, [
      token,
    ]);
  });

  needCasa1 = await db.asUser(ALISSON, async (client) => {
    const result = await client.query(
      `insert into public.needs (household_id, title, category)
       values ($1, 'Berço montessoriano', 'quarto') returning id`,
      [casa1],
    );
    return result.rows[0].id as string;
  });
}, 240_000);

afterAll(async () => {
  await db?.stop();
}, 60_000);

describe("onboarding (RPC create_household_with_baby)", () => {
  it("cria household, perfil owner, bebê e configurações", async () => {
    const { rows } = await db.admin.query(
      `select
         (select count(*) from public.profiles where household_id = $1 and role = 'owner') as owners,
         (select count(*) from public.babies where household_id = $1 and name = 'Cael') as bebes,
         (select count(*) from public.household_settings where household_id = $1) as configs`,
      [casa1],
    );
    expect(rows[0]).toEqual({ owners: "1", bebes: "1", configs: "1" });
  });

  it("recusa segundo onboarding do mesmo usuário", async () => {
    await expect(
      db.asUser(ALISSON, (client) =>
        client.query(
          `select public.create_household_with_baby('Outra', 'A', 'B')`,
        ),
      ),
    ).rejects.toThrow(/já pertence a uma família/);
  });
});

describe("isolamento entre households (seção 4.4)", () => {
  it("membro de outra casa não vê os dados da casa 1", async () => {
    const rows = await db.asUser(VIZINHA, async (client) => {
      const result = await client.query(`select id from public.needs`);
      return result.rows;
    });
    expect(rows.map((row) => row.id)).not.toContain(needCasa1);
  });

  it("não é possível inserir dado apontando para household alheio", async () => {
    await expect(
      db.asUser(VIZINHA, (client) =>
        client.query(
          `insert into public.needs (household_id, title, category)
           values ($1, 'Invasão', 'quarto')`,
          [casa1],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("update de outra casa não alcança nenhuma linha", async () => {
    const rowCount = await db.asUser(VIZINHA, async (client) => {
      const result = await client.query(
        `update public.needs set title = 'hackeado' where id = $1`,
        [needCasa1],
      );
      return result.rowCount;
    });
    expect(rowCount).toBe(0);
  });
});

describe("papéis owner e collaborator (seções 4.1 e 4.2)", () => {
  it("colaboradora cria e edita itens da casa", async () => {
    const rowCount = await db.asUser(DUDA, async (client) => {
      await client.query(
        `insert into public.needs (household_id, title, category)
         values ($1, 'Fraldas RN', 'fraldas')`,
        [casa1],
      );
      const result = await client.query(
        `update public.needs set priority = 'alta' where title = 'Fraldas RN'`,
      );
      return result.rowCount;
    });
    expect(rowCount).toBe(1);
  });

  it("colaboradora não exclui definitivamente; owner sim", async () => {
    const alvo = await db.asUser(ALISSON, async (client) => {
      const result = await client.query(
        `insert into public.needs (household_id, title, category)
         values ($1, 'Item descartável', 'higiene') returning id`,
        [casa1],
      );
      return result.rows[0].id as string;
    });

    const deleteDuda = await db.asUser(DUDA, async (client) => {
      const result = await client.query(
        `delete from public.needs where id = $1`,
        [alvo],
      );
      return result.rowCount;
    });
    expect(deleteDuda).toBe(0);

    const deleteAlisson = await db.asUser(ALISSON, async (client) => {
      const result = await client.query(
        `delete from public.needs where id = $1`,
        [alvo],
      );
      return result.rowCount;
    });
    expect(deleteAlisson).toBe(1);
  });

  it("colaboradora não vê nem cria convites", async () => {
    const visiveis = await db.asUser(DUDA, async (client) => {
      const result = await client.query(
        `select id from public.household_invites`,
      );
      return result.rowCount;
    });
    expect(visiveis).toBe(0);

    await expect(
      db.asUser(DUDA, (client) =>
        client.query(
          `insert into public.household_invites (household_id, email)
           values ($1, 'x@teste.local')`,
          [casa1],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("configurações do household: colaboradora não altera, owner altera", async () => {
    const updateDuda = await db.asUser(DUDA, async (client) => {
      const result = await client.query(
        `update public.household_settings set show_future_items = false
         where household_id = $1`,
        [casa1],
      );
      return result.rowCount;
    });
    expect(updateDuda).toBe(0);

    const updateAlisson = await db.asUser(ALISSON, async (client) => {
      const result = await client.query(
        `update public.household_settings set show_future_items = false
         where household_id = $1`,
        [casa1],
      );
      return result.rowCount;
    });
    expect(updateAlisson).toBe(1);
  });

  it("fila de sincronização: escrita é do owner", async () => {
    await expect(
      db.asUser(DUDA, (client) =>
        client.query(
          `insert into public.sync_queue (household_id, entity_type, entity_id, operation, idempotency_key)
           values ($1, 'need', $2, 'update', 'k-duda-1')`,
          [casa1, needCasa1],
        ),
      ),
    ).rejects.toThrow(/row-level security/);

    const inserted = await db.asUser(ALISSON, async (client) => {
      const result = await client.query(
        `insert into public.sync_queue (household_id, entity_type, entity_id, operation, idempotency_key)
         values ($1, 'need', $2, 'update', 'k-alisson-1')`,
        [casa1, needCasa1],
      );
      return result.rowCount;
    });
    expect(inserted).toBe(1);
  });

  it("perfil: cada um edita o próprio nome, ninguém muda o próprio papel", async () => {
    const renomeia = await db.asUser(DUDA, async (client) => {
      const result = await client.query(
        `update public.profiles set display_name = 'Duda ✨' where id = $1`,
        [DUDA],
      );
      return result.rowCount;
    });
    expect(renomeia).toBe(1);

    await expect(
      db.asUser(DUDA, (client) =>
        client.query(
          `update public.profiles set role = 'owner' where id = $1`,
          [DUDA],
        ),
      ),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("convites (RPC accept_household_invite)", () => {
  it("token inexistente é recusado", async () => {
    await expect(
      db.asUser(CONVIDADA_REPETIDA, (client) =>
        client.query(
          `select public.accept_household_invite('99999999-9999-4999-8999-999999999999', 'Alguém')`,
        ),
      ),
    ).rejects.toThrow(/não encontrado/);
  });

  it("convite expirado é recusado", async () => {
    const token = await db.asUser(ALISSON, async (client) => {
      const result = await client.query(
        `insert into public.household_invites (household_id, email, expires_at)
         values ($1, 'expirada@teste.local', now() - interval '1 hour')
         returning token`,
        [casa1],
      );
      return result.rows[0].token as string;
    });

    await expect(
      db.asUser(CONVIDADA_EXPIRADA, (client) =>
        client.query(`select public.accept_household_invite($1, 'Expirada')`, [
          token,
        ]),
      ),
    ).rejects.toThrow(/expirou/);
  });

  it("convite já aceito não pode ser reutilizado", async () => {
    const tokenUsado = await db.admin
      .query(
        `select token from public.household_invites
         where accepted_at is not null limit 1`,
      )
      .then((result) => result.rows[0].token as string);

    await expect(
      db.asUser(CONVIDADA_REPETIDA, (client) =>
        client.query(`select public.accept_household_invite($1, 'Repetida')`, [
          tokenUsado,
        ]),
      ),
    ).rejects.toThrow(/já foi utilizado/);
  });
});

describe("regras de integridade do domínio", () => {
  it("decisão médica não pode ser decidida sem conclusão (seção 10.11)", async () => {
    await expect(
      db.asUser(ALISSON, (client) =>
        client.query(
          `insert into public.decisions (household_id, title, type, status)
           values ($1, 'Qual vacina?', 'medica', 'decidida')`,
          [casa1],
        ),
      ),
    ).rejects.toThrow(/decisao_medica_exige_conclusao/);
  });

  it("tarefa concluída exige completed_at", async () => {
    await expect(
      db.asUser(ALISSON, (client) =>
        client.query(
          `insert into public.tasks (household_id, title, status)
           values ($1, 'Tarefa sem data', 'concluida')`,
          [casa1],
        ),
      ),
    ).rejects.toThrow(/tasks_concluida_tem_data/);
  });

  it("conflito aberto é único por entidade+campo", async () => {
    await db.asUser(ALISSON, (client) =>
      client.query(
        `insert into public.sync_conflicts (household_id, entity_type, entity_id, field, app_value, notion_value)
         values ($1, 'need', $2, 'estimated_price', '"100"', '"120"')`,
        [casa1, needCasa1],
      ),
    );
    await expect(
      db.asUser(ALISSON, (client) =>
        client.query(
          `insert into public.sync_conflicts (household_id, entity_type, entity_id, field, app_value, notion_value)
           values ($1, 'need', $2, 'estimated_price', '"100"', '"130"')`,
          [casa1, needCasa1],
        ),
      ),
    ).rejects.toThrow(/sync_conflicts_abertos_unicos/);
  });
});
