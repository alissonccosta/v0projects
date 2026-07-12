import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const screenshotDir = path.join(__dirname, "..", "..", "docs", "qa", "fase-2");

/**
 * Fluxos de autenticação (SDD, seção 27).
 *
 * Sem Supabase configurado, valida o modo demonstração honesto (seção 46).
 * Com Supabase configurado (variáveis presentes ao rodar o e2e), os testes
 * do formulário real são ativados automaticamente.
 */
const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

test("modo demonstração: /login explica a configuração pendente, sem controles falsos", async ({
  page,
}, testInfo) => {
  test.skip(configured, "com Supabase configurado o login mostra o formulário");

  await page.goto("/login");
  await expect(
    page.getByText("Autenticação ainda não configurada"),
  ).toBeVisible();
  await expect(
    page.locator("main input, main button, main select, main textarea"),
  ).toHaveCount(0);

  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotDir, `login-demo-${testInfo.project.name}.png`),
    fullPage: true,
  });
});

test("modo demonstração: aviso 'Sem autenticação' visível no app", async ({
  page,
}) => {
  test.skip(configured, "aviso existe apenas sem Supabase");

  await page.goto("/app/dashboard");
  await expect(
    page.locator("header").getByText(/Sem autenticação/),
  ).toBeVisible();
});

test("modo demonstração: necessidades explica a configuração pendente", async ({
  page,
}, testInfo) => {
  test.skip(configured, "com Supabase a lista real aparece");

  await page.goto("/app/necessidades");
  await expect(
    page.getByText("Disponível após configurar a autenticação"),
  ).toBeVisible();

  const fase3Dir = path.join(__dirname, "..", "..", "docs", "qa", "fase-3");
  fs.mkdirSync(fase3Dir, { recursive: true });
  await page.screenshot({
    path: path.join(fase3Dir, `necessidades-demo-${testInfo.project.name}.png`),
    fullPage: true,
  });
});

test("modo demonstração: onboarding e convite levam ao /login", async ({
  page,
}) => {
  test.skip(configured, "fluxo muda com Supabase configurado");

  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/convite/ce3fe570-7121-4e8f-a63a-0e89bbf11d28");
  await expect(page).toHaveURL(/\/login\?next=/);
});

test("configurações mostra Família real e módulos futuros sem links falsos", async ({
  page,
}, testInfo) => {
  await page.goto("/app/configuracoes");
  await expect(page.getByRole("link", { name: /Família/ })).toBeVisible();
  await expect(page.getByText("Integração com o Notion")).toBeVisible();
  // Módulos futuros não são links (seção 0.2: presentes apenas como informação).
  await expect(
    page.getByRole("link", { name: /Integração com o Notion/ }),
  ).toHaveCount(0);

  await page.getByRole("link", { name: /Família/ }).click();
  await expect(page).toHaveURL(/\/app\/configuracoes\/familia$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Família" }),
  ).toBeVisible();

  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotDir, `familia-${testInfo.project.name}.png`),
    fullPage: true,
  });
});

test("com Supabase: /login mostra o formulário de magic link", async ({
  page,
}) => {
  test.skip(!configured, "requer NEXT_PUBLIC_SUPABASE_* configuradas");

  await page.goto("/login");
  await expect(page.getByLabel(/E-mail/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enviar link de acesso" }),
  ).toBeVisible();
});

test("com Supabase: rota protegida sem sessão redireciona ao login", async ({
  page,
}) => {
  test.skip(!configured, "requer NEXT_PUBLIC_SUPABASE_* configuradas");

  await page.goto("/app/dashboard");
  await expect(page).toHaveURL(/\/login\?next=/);
});
