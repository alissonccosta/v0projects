import { z } from "zod";

/**
 * Validação das variáveis de ambiente do Ninho do Cael (SDD, seção 7.3).
 *
 * Na Fase 0 nenhuma integração está ativa, então todas as variáveis são
 * opcionais no parse geral — mas, quando presentes, precisam ter formato
 * válido. Funcionalidades que dependem de uma variável devem usar
 * `requireServerEnv`, que falha com mensagem clara em vez de operar com
 * valores ausentes ou fingir integração.
 */

const optionalNonEmpty = z.string().trim().min(1).optional();

export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalNonEmpty,
  // Somente servidor. Nunca expor ao cliente (SDD, seção 0.1).
  SUPABASE_SERVICE_ROLE_KEY: optionalNonEmpty,

  // Notion (somente servidor; o navegador nunca acessa o token — SDD, seção 6.2)
  NOTION_ACCESS_TOKEN: optionalNonEmpty,
  NOTION_WEBHOOK_SECRET: optionalNonEmpty,
  NOTION_VERSION: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "NOTION_VERSION deve ser uma data no formato AAAA-MM-DD",
    )
    .optional(),
  NOTION_NEEDS_DATA_SOURCE_ID: z.uuid().optional(),
  NOTION_PRODUCTS_DATA_SOURCE_ID: z.uuid().optional(),
  NOTION_PURCHASES_DATA_SOURCE_ID: z.uuid().optional(),
  NOTION_INVENTORY_DATA_SOURCE_ID: z.uuid().optional(),
  NOTION_TASKS_DATA_SOURCE_ID: z.uuid().optional(),
  NOTION_DECISIONS_DATA_SOURCE_ID: z.uuid().optional(),

  // Aplicação
  CRON_SECRET: optionalNonEmpty,
  APP_URL: z.url().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ServerEnvKey = keyof ServerEnv;

export const clientEnvSchema = serverEnvSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: true,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvValidationError";
  }
}

/** Trata strings vazias do `.env` como variável ausente. */
function normalizeRawEnv(
  raw: Record<string, string | undefined>,
): Record<string, string | undefined> {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = value?.trim() === "" ? undefined : value;
  }
  return normalized;
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `- ${issue.path.join(".") || "(raiz)"}: ${issue.message}`)
    .join("\n");
}

/** Função pura e testável: valida um conjunto de variáveis de servidor. */
export function parseServerEnv(
  raw: Record<string, string | undefined>,
): ServerEnv {
  const result = serverEnvSchema.safeParse(normalizeRawEnv(raw));
  if (!result.success) {
    throw new EnvValidationError(
      `Variáveis de ambiente inválidas:\n${formatIssues(result.error)}\n` +
        "Confira o arquivo .env.example para o formato esperado.",
    );
  }
  return result.data;
}

let cachedServerEnv: ServerEnv | undefined;

/** Lê e valida `process.env` no servidor. Proibido no cliente. */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new EnvValidationError(
      "getServerEnv() não pode ser usado no navegador. " +
        "Variáveis de servidor nunca devem chegar ao cliente.",
    );
  }
  cachedServerEnv ??= parseServerEnv(process.env);
  return cachedServerEnv;
}

/** Somente para testes: limpa o cache de ambiente. */
export function resetServerEnvCache(): void {
  cachedServerEnv = undefined;
}

/**
 * Exige a presença de variáveis específicas. Use na fronteira de cada
 * funcionalidade (ex.: sincronização com o Notion) para falhar cedo e com
 * explicação, em vez de fingir que a integração está ativa.
 */
export function requireServerEnv<K extends ServerEnvKey>(
  keys: readonly K[],
  env: ServerEnv = getServerEnv(),
): { [P in K]: NonNullable<ServerEnv[P]> } {
  const missing = keys.filter(
    (key) => env[key] === undefined || env[key] === null,
  );
  if (missing.length > 0) {
    throw new EnvValidationError(
      `Variáveis de ambiente obrigatórias ausentes: ${missing.join(", ")}. ` +
        "Preencha o arquivo .env.local seguindo o .env.example.",
    );
  }
  const picked = {} as { [P in K]: NonNullable<ServerEnv[P]> };
  for (const key of keys) {
    picked[key] = env[key] as NonNullable<ServerEnv[K]>;
  }
  return picked;
}
