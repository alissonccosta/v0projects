import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  expectNoSeriousA11yViolations,
} from "./helpers";

// Evidências visuais da fase (SDD, seção 0.3).
const screenshotDir = path.join(__dirname, "..", "..", "docs", "qa", "fase-1");

test("a raiz leva ao painel, sem overflow e sem violações graves de acessibilidade", async ({
  page,
}, testInfo) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/app\/dashboard$/);

  await expect(page).toHaveTitle(/Ninho do Cael/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Início" }),
  ).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectNoSeriousA11yViolations(page);

  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotDir, `dashboard-${testInfo.project.name}.png`),
    fullPage: true,
  });
});
