import { test as setup, expect } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { AUTH_FILE } from "./paths";

/**
 * Logs in once and saves the session so the authed routes are tested as a real
 * user sees them rather than as a redirect to /auth/login — which returns 200
 * and would make a broken dashboard look healthy.
 *
 * Set E2E_EMAIL and E2E_PASSWORD to enable. Without them the suite still runs,
 * but every route behind auth is reported as SKIPPED, never as passed.
 */
setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  setup.skip(
    !email || !password,
    "E2E_EMAIL / E2E_PASSWORD not set — authed routes will be skipped, not passed"
  );

  await page.goto("/auth/login");
  await page.getByLabel(/email/i).fill(email!);
  await page.getByLabel(/password/i).fill(password!);
  await page.getByRole("button", { name: /log ?in|sign ?in/i }).click();

  // The redirect away from /auth/login is the only reliable success signal.
  await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 15_000 });

  mkdirSync(dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
  if (!existsSync(AUTH_FILE)) throw new Error("storage state was not written");
});
