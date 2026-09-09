import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke-test configuration.
 *
 * The suite exists to answer one question before a batch of changes is called
 * done: does every page still load, and does every control still lead
 * somewhere? It is not a functional test suite and should stay fast enough
 * that nobody is tempted to skip it.
 */
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  // A dead button is a deterministic defect. Retrying would only hide flake in
  // the app itself, which is exactly what this suite is meant to expose.
  retries: 0,
  timeout: 30_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    // Runs first and writes e2e/.auth/user.json. Skips itself when no
    // credentials are configured, and the authed routes are then reported as
    // unverified rather than quietly passing against a login redirect.
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
