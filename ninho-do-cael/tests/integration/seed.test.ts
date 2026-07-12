// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startTestDb, type TestDb } from "./helpers/test-db";

/**
 * Aplica o seed de desenvolvimento num Postgres real e verifica os
 * requisitos da seção 38 do SDD.
 */

const SEED_FILE = path.join(__dirname, "..", "..", "supabase", "seed.sql");
const SEED_HOUSEHOLD = "d0000000-0000-4000-8000-000000000001";

let db: TestDb;

beforeAll(async () => {
  db = await startTestDb();
  const seedSql = readFileSync(SEED_FILE, "utf8");
  await db.admin.query(seedSql);
  // Idempotência: rodar de novo não pode falhar nem duplicar.
  await db.admin.query(seedSql);
}, 240_000);

afterAll(async () => {
  await db?.stop();
}, 60_000);

describe("seed de desenvolvimento (seção 38)", () => {
  it("cria a família seed com Alisson owner e Duda collaborator", async () => {
    const { rows } = await db.admin.query(
      `select
         (select name from public.households where id = $1) as household,
         (select count(*) from public.profiles where household_id = $1 and role = 'owner') as owners,
         (select count(*) from public.profiles where household_id = $1 and role = 'collaborator') as collabs,
         (select name from public.babies where household_id = $1) as baby`,
      [SEED_HOUSEHOLD],
    );
    expect(rows[0].household).toContain("(SEED DEV)");
    expect(rows[0]).toMatchObject({ owners: "1", collabs: "1", baby: "Cael" });
  });

  it("tem pelo menos 30 necessidades cobrindo todas as 13 categorias", async () => {
    const { rows } = await db.admin.query(
      `select count(*)::int as total, count(distinct category)::int as categorias
         from public.needs where household_id = $1`,
      [SEED_HOUSEHOLD],
    );
    expect(rows[0].total).toBeGreaterThanOrEqual(30);
    expect(rows[0].categorias).toBe(13);
  });

  it("inclui os cenários exigidos: entrega parcial, lavar, bloqueio, médica, futuro, conflito e erro de sync", async () => {
    const { rows } = await db.admin.query(
      `select
         exists(select 1 from public.purchases
                 where household_id = $1 and status = 'entregue_parcial'
                   and discount > 0 and shipping > 0) as compra_parcial_com_desconto_frete,
         exists(select 1 from public.inventory_items
                 where household_id = $1 and readiness_status = 'precisa_lavar') as item_precisa_lavar,
         exists(select 1 from public.tasks
                 where household_id = $1 and status = 'bloqueada'
                   and depends_on_task_id is not null and blocked_reason is not null) as tarefa_bloqueada,
         exists(select 1 from public.decisions
                 where household_id = $1 and type = 'medica'
                   and status = 'aguardando_profissional' and conclusion is null) as decisao_medica_pendente,
         exists(select 1 from public.needs
                 where household_id = $1 and phase in ('meses_6_12', 'apos_12_meses')) as item_futuro,
         exists(select 1 from public.sync_conflicts
                 where household_id = $1 and status = 'aberto') as conflito_aberto,
         exists(select 1 from public.sync_queue
                 where household_id = $1 and status = 'falha' and last_error is not null) as erro_de_sync`,
      [SEED_HOUSEHOLD],
    );
    expect(rows[0]).toEqual({
      compra_parcial_com_desconto_frete: true,
      item_precisa_lavar: true,
      tarefa_bloqueada: true,
      decisao_medica_pendente: true,
      item_futuro: true,
      conflito_aberto: true,
      erro_de_sync: true,
    });
  });

  it("valores dos pedidos seguem total = subtotal - desconto + frete (seção 10.9)", async () => {
    const { rows } = await db.admin.query(
      `select count(*)::int as divergentes
         from public.purchases
        where household_id = $1
          and abs(total - (subtotal - discount + shipping)) > 0.01`,
      [SEED_HOUSEHOLD],
    );
    expect(rows[0].divergentes).toBe(0);
  });
});
