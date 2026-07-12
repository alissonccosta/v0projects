import { describe, expect, it } from "vitest";

import {
  EnvValidationError,
  getServerEnv,
  parseServerEnv,
  requireServerEnv,
} from "@/lib/env";

const fullValidEnv = {
  NODE_ENV: "test",
  NEXT_PUBLIC_SUPABASE_URL: "https://exemplo.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_exemplo",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_exemplo",
  NOTION_ACCESS_TOKEN: "ntn_exemplo",
  NOTION_WEBHOOK_SECRET: "segredo",
  NOTION_VERSION: "2026-03-11",
  NOTION_NEEDS_DATA_SOURCE_ID: "ce3fe570-7121-4e8f-a63a-0e89bbf11d28",
  NOTION_PRODUCTS_DATA_SOURCE_ID: "eec3bfd4-0785-4846-8355-552a83215e46",
  NOTION_PURCHASES_DATA_SOURCE_ID: "5703fbdc-8707-42b1-b08b-a59abcf0b903",
  NOTION_INVENTORY_DATA_SOURCE_ID: "521896bd-ffaa-43fb-aa4e-9739a1bbc558",
  NOTION_TASKS_DATA_SOURCE_ID: "221db659-addc-4b1c-a0e5-ad35a3d998c7",
  NOTION_DECISIONS_DATA_SOURCE_ID: "ccce3fe5-2a2e-4b63-ae83-925c3b4d6403",
  CRON_SECRET: "cron",
  APP_URL: "https://ninho.exemplo.app",
} as const;

describe("parseServerEnv", () => {
  it("aceita ambiente vazio na Fase 0 (integrações ainda não configuradas)", () => {
    const env = parseServerEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.NOTION_ACCESS_TOKEN).toBeUndefined();
  });

  it("trata string vazia como variável ausente", () => {
    const env = parseServerEnv({ NOTION_ACCESS_TOKEN: "  " });
    expect(env.NOTION_ACCESS_TOKEN).toBeUndefined();
  });

  it("aceita o conjunto completo de variáveis da seção 7.3 do SDD", () => {
    const env = parseServerEnv(fullValidEnv);
    expect(env.NOTION_VERSION).toBe("2026-03-11");
    expect(env.NOTION_NEEDS_DATA_SOURCE_ID).toBe(
      "ce3fe570-7121-4e8f-a63a-0e89bbf11d28",
    );
    expect(env.APP_URL).toBe("https://ninho.exemplo.app");
  });

  it("rejeita URL inválida com mensagem apontando a variável", () => {
    expect(() =>
      parseServerEnv({ NEXT_PUBLIC_SUPABASE_URL: "nao-e-url" }),
    ).toThrowError(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("rejeita data source ID que não é UUID", () => {
    expect(() =>
      parseServerEnv({ NOTION_NEEDS_DATA_SOURCE_ID: "abc123" }),
    ).toThrowError(EnvValidationError);
  });

  it("rejeita NOTION_VERSION fora do formato AAAA-MM-DD", () => {
    expect(() => parseServerEnv({ NOTION_VERSION: "hoje" })).toThrowError(
      /AAAA-MM-DD/,
    );
  });
});

describe("requireServerEnv", () => {
  it("retorna somente as variáveis pedidas quando presentes", () => {
    const env = parseServerEnv(fullValidEnv);
    const notion = requireServerEnv(
      ["NOTION_ACCESS_TOKEN", "NOTION_VERSION"],
      env,
    );
    expect(notion).toEqual({
      NOTION_ACCESS_TOKEN: "ntn_exemplo",
      NOTION_VERSION: "2026-03-11",
    });
  });

  it("lança erro em português listando as variáveis ausentes", () => {
    const env = parseServerEnv({});
    expect(() =>
      requireServerEnv(["NOTION_ACCESS_TOKEN", "CRON_SECRET"], env),
    ).toThrowError(/ausentes: NOTION_ACCESS_TOKEN, CRON_SECRET/);
  });
});

describe("getServerEnv", () => {
  it("recusa execução em ambiente com window (proteção de segredos)", () => {
    // O ambiente de teste usa jsdom, então `window` existe — exatamente o
    // cenário que a função deve bloquear.
    expect(() => getServerEnv()).toThrowError(
      /não pode ser usado no navegador/,
    );
  });
});
