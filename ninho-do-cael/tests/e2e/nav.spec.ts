import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  expectNoSeriousA11yViolations,
} from "./helpers";

const screenshotDir = path.join(__dirname, "..", "..", "docs", "qa", "fase-1");

// Sidebar desktop (SDD, seção 11.2).
const SIDEBAR_SECTIONS = [
  { label: "Necessidades", url: "/app/necessidades" },
  { label: "Compras", url: "/app/compras" },
  { label: "Estoque", url: "/app/estoque" },
  { label: "Tarefas", url: "/app/tarefas" },
  { label: "Decisões", url: "/app/decisoes" },
  { label: "Jornada", url: "/app/jornada" },
  { label: "Orçamento", url: "/app/orcamento" },
  { label: "Configurações", url: "/app/configuracoes" },
];

// Todas as rotas visíveis da Fase 1 (seção 11.1 + referência interna).
const ALL_ROUTES = [
  "/app/dashboard",
  "/app/necessidades",
  "/app/produtos",
  "/app/compras",
  "/app/estoque",
  "/app/tarefas",
  "/app/decisoes",
  "/app/jornada",
  "/app/orcamento",
  "/app/atividade",
  "/app/configuracoes",
  "/app/configuracoes/familia",
  "/app/design-system",
];

function isMobileViewport(width: number | undefined) {
  return (width ?? 0) < 1024;
}

test("nenhuma rota tem overflow horizontal", async ({ page }) => {
  for (const route of ALL_ROUTES) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

test("sidebar desktop navega por todas as seções com estado ativo", async ({
  page,
}) => {
  test.skip(
    isMobileViewport(page.viewportSize()?.width),
    "sidebar existe apenas em viewports desktop",
  );

  await page.goto("/app/dashboard");
  const sidebar = page.getByRole("navigation", { name: "Navegação principal" });

  for (const section of SIDEBAR_SECTIONS) {
    await sidebar.getByRole("link", { name: section.label }).click();
    await expect(page).toHaveURL(new RegExp(`${section.url}$`));
    await expect(
      page.getByRole("heading", { level: 1, name: section.label }),
    ).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: section.label }),
    ).toHaveAttribute("aria-current", "page");
  }
});

test("breadcrumb do header reflete a seção atual (desktop)", async ({
  page,
}) => {
  test.skip(
    isMobileViewport(page.viewportSize()?.width),
    "breadcrumb completo é desktop",
  );
  await page.goto("/app/orcamento");
  const breadcrumb = page.getByRole("navigation", { name: "Localização" });
  await expect(breadcrumb.getByText("Orçamento")).toBeVisible();
});

test("barra inferior mobile: navegação, alvos de toque ≥44px e folha Mais", async ({
  page,
}, testInfo) => {
  test.skip(
    !isMobileViewport(page.viewportSize()?.width),
    "barra inferior existe apenas no mobile",
  );

  await page.goto("/app/dashboard");
  const bottomNav = page.getByRole("navigation", {
    name: "Navegação principal",
  });

  // Alvos de toque mínimos (SDD, seção 13.2).
  for (const name of ["Início", "Necessidades", "Tarefas", "Compras", "Mais"]) {
    const target = bottomNav.getByRole(name === "Mais" ? "button" : "link", {
      name,
    });
    const box = await target.boundingBox();
    expect(box, `alvo de toque de ${name}`).not.toBeNull();
    expect(box!.height, `altura de ${name}`).toBeGreaterThanOrEqual(44);
    expect(box!.width, `largura de ${name}`).toBeGreaterThanOrEqual(44);
  }

  // Navegação direta.
  await bottomNav.getByRole("link", { name: "Necessidades" }).click();
  await expect(page).toHaveURL(/\/app\/necessidades$/);
  await expect(
    bottomNav.getByRole("link", { name: "Necessidades" }),
  ).toHaveAttribute("aria-current", "page");

  // Folha "Mais" (SDD, seção 11.3).
  await bottomNav.getByRole("button", { name: "Mais" }).click();
  const sheet = page.getByRole("dialog", { name: "Mais seções" });
  await expect(sheet).toBeVisible();

  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotDir, `mais-sheet-${testInfo.project.name}.png`),
  });

  await sheet.getByRole("link", { name: "Orçamento" }).click();
  await expect(page).toHaveURL(/\/app\/orcamento$/);
  await expect(sheet).not.toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("design system e placeholders sem violações graves de acessibilidade", async ({
  page,
}, testInfo) => {
  for (const route of ["/app/necessidades", "/app/design-system"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  }

  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.goto("/app/necessidades");
  await page.screenshot({
    path: path.join(screenshotDir, `necessidades-${testInfo.project.name}.png`),
    fullPage: true,
  });
  await page.goto("/app/design-system");
  await page.screenshot({
    path: path.join(
      screenshotDir,
      `design-system-${testInfo.project.name}.png`,
    ),
    fullPage: true,
  });
});

test("confirmação e feedback funcionam de ponta a ponta", async ({ page }) => {
  await page.goto("/app/design-system");
  await page
    .getByRole("button", { name: "Abrir confirmação", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Arquivar este item?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Arquivar", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("Confirmação executada")).toBeVisible();
});
