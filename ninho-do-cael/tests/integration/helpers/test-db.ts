import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import EmbeddedPostgres from "embedded-postgres";
import { Client } from "pg";

/**
 * Sobe um Postgres 17 real (binários via npm) com o shim do Supabase e todas
 * as migrations aplicadas — os testes de RLS rodam contra o banco de verdade.
 *
 * Atenção: o Postgres se recusa a rodar como root. Em ambientes root
 * (alguns containers), execute os testes com um usuário comum
 * (ex.: `su pgtest -c "npm run test"`). No CI do GitHub isso já é o padrão.
 */

const MIGRATIONS_DIR = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "supabase",
  "migrations",
);
const SHIM_FILE = path.join(__dirname, "supabase-shim.sql");

export type TestDb = {
  /** Conexão superusuário (equivalente ao service_role: ignora RLS). */
  admin: Client;
  /** Executa um bloco como usuário autenticado (role + claims do JWT). */
  asUser: <T>(userId: string, fn: (client: Client) => Promise<T>) => Promise<T>;
  createAuthUser: (id: string, email: string) => Promise<void>;
  stop: () => Promise<void>;
};

export async function startTestDb(): Promise<TestDb> {
  const dataDir = mkdtempSync(path.join(os.tmpdir(), "ninho-pg-"));
  const port = 54000 + (process.pid % 1000);

  const server = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: "postgres",
    password: "postgres",
    port,
    persistent: false,
  });

  await server.initialise();
  await server.start();
  await server.createDatabase("ninho_test");

  const connection = {
    host: "127.0.0.1",
    port,
    user: "postgres",
    password: "postgres",
    database: "ninho_test",
  };

  const admin = new Client(connection);
  await admin.connect();

  // Shim do Supabase e migrations, na ordem dos arquivos.
  await admin.query(readFileSync(SHIM_FILE, "utf8"));
  const migrationFiles = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  for (const file of migrationFiles) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    try {
      await admin.query(sql);
    } catch (error) {
      throw new Error(`Falha ao aplicar migration ${file}: ${String(error)}`);
    }
  }

  async function asUser<T>(
    userId: string,
    fn: (client: Client) => Promise<T>,
  ): Promise<T> {
    const client = new Client(connection);
    await client.connect();
    try {
      await client.query("begin");
      await client.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: userId, role: "authenticated" }),
      ]);
      await client.query("set local role authenticated");
      const result = await fn(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback").catch(() => undefined);
      throw error;
    } finally {
      await client.end();
    }
  }

  async function createAuthUser(id: string, email: string): Promise<void> {
    await admin.query(
      "insert into auth.users (id, email) values ($1, $2) on conflict (id) do nothing",
      [id, email],
    );
  }

  async function stop(): Promise<void> {
    await admin.end().catch(() => undefined);
    await server.stop();
    rmSync(dataDir, { recursive: true, force: true });
  }

  return { admin, asUser, createAuthUser, stop };
}
