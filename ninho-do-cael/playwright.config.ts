import { defineConfig, devices } from "@playwright/test";

// Em ambientes onde o download de browsers não é possível, aponte
// PW_CHROMIUM_PATH para um executável Chromium existente.
const executablePath = process.env.PW_CHROMIUM_PATH;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    launchOptions: {
      // Necessário em containers que executam como root (ex.: CI e ambientes remotos).
      chromiumSandbox: false,
      ...(executablePath ? { executablePath } : {}),
    },
  },
  projects: [
    {
      name: "desktop-1440",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-390",
      // Emulação móvel em Chromium (WebKit não está disponível no ambiente).
      // Viewport 390×844: o principal viewport móvel do SDD (seção 13.1).
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
