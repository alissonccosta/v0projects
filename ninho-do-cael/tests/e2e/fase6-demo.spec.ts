import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  expectNoSeriousA11yViolations,
} from "./helpers";

/**
 * Fase 6 em modo demonstração (seção 46): painel, orçamento e atividade
 * explicam a configuração pendente — sem números inventados e sem controles
 * falsos — e seguem acessíveis e sem overflow.
 */

const screenshotDir = path.join(__dirname, "..", "..", "docs", "qa", "fase-6");

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

const PAGES = [
  { url: "/app/dashboard", heading: "Início", slug: "dashboard" },
  { url: "/app/orcamento", heading: "Orçamento", slug: "orcamento" },
  { url: "/app/atividade", heading: "Atividade", slug: "atividade" },
];

test("modo demonstração: painel, orçamento e atividade explicam a configuração pendente", async ({
  page,
}, testInfo) => {
  test.skip(configured, "com Supabase as telas reais aparecem");

  fs.mkdirSync(screenshotDir, { recursive: true });
  for (const target of PAGES) {
    await page.goto(target.url);
    await expect(
      page.getByRole("heading", { level: 1, name: target.heading }),
    ).toBeVisible();
    await expect(
      page.getByText("Disponível após configurar a autenticação"),
    ).toBeVisible();
    // Sem números fabricados: nenhum card de métrica no modo demonstração.
    await expect(
      page.locator("main input, main select, main textarea"),
    ).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    await expectNoSeriousA11yViolations(page);
    await page.screenshot({
      path: path.join(
        screenshotDir,
        `${target.slug}-demo-${testInfo.project.name}.png`,
      ),
      fullPage: true,
    });
  }

  // Sem autenticação, a busca global não aparece (seria um controle falso).
  await page.goto("/app/dashboard");
  await expect(page.getByRole("button", { name: "Pesquisar" })).toHaveCount(0);
});
