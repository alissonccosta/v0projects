import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  expectNoSeriousA11yViolations,
} from "./helpers";

/**
 * Fase 5 em modo demonstração (seção 46): tarefas, decisões e jornada
 * explicam a configuração pendente com EmptyState honesto — sem controles
 * falsos — e continuam acessíveis e sem overflow.
 */

const screenshotDir = path.join(__dirname, "..", "..", "docs", "qa", "fase-5");

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

const PAGES = [
  { url: "/app/tarefas", heading: "Tarefas", slug: "tarefas" },
  { url: "/app/decisoes", heading: "Decisões", slug: "decisoes" },
  { url: "/app/jornada", heading: "Jornada", slug: "jornada" },
];

test("modo demonstração: tarefas, decisões e jornada explicam a configuração pendente", async ({
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
    // Sem formulários nem botões falsos no modo demonstração.
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
});
