import fs from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Evidências visuais da fase (SDD, seção 0.3).
const screenshotDir = path.join(__dirname, "..", "..", "docs", "qa", "fase-0");

test("página inicial responde, sem overflow horizontal e sem violações graves de acessibilidade", async ({
  page,
}, testInfo) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle(/Ninho do Cael/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Ninho do Cael" }),
  ).toBeVisible();

  // Sem overflow horizontal em nenhum viewport (SDD, seções 0.1 e 13).
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

  // Acessibilidade WCAG 2.2 AA (SDD, seção 31): nenhuma violação grave.
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const graves = axe.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );
  expect(graves).toEqual([]);

  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotDir, `home-${testInfo.project.name}.png`),
    fullPage: true,
  });
});
