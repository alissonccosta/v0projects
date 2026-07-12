import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    "sem overflow horizontal (SDD, seções 0.1 e 13)",
  ).toBeLessThanOrEqual(clientWidth);
}

export async function expectNoSeriousA11yViolations(page: Page) {
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const graves = axe.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );
  expect(graves).toEqual([]);
}
