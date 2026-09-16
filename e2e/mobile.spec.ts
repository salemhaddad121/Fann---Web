import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { AUTH_FILE } from "./paths";

/**
 * The checks that only fail at phone width.
 *
 * This file exists because of B7. Log Out lived in exactly one place — the
 * foot of the desktop Sidebar, which is `lg:`-only — so at 390px an artist
 * or a booker could not sign out at all. The smoke suite passed the whole
 * time, because every project in it ran at desktop width, on a product
 * whose primary surface is a phone.
 *
 * Scoped deliberately rather than re-running all 48 routes at a second
 * viewport. The suite is already load-flaky at four workers (see
 * ISSUES.md); doubling it would buy coverage at the cost of a gate people
 * start ignoring, which is worse than no gate. These are the two failures
 * that are invisible from desktop and expensive when missed: a control
 * that is only reachable on a wide screen, and a layout that scrolls
 * sideways.
 */

const HAVE_AUTH = existsSync(AUTH_FILE);

// Pages a signed-in user spends time on, and where being unable to sign out
// or having the layout overflow actually costs something.
const AUTHED_PAGES = ["/dashboard", "/account", "/profile", "/search"];

// Reachable signed out, and the first thing most visitors see on a phone.
const PUBLIC_PAGES = ["/", "/plans", "/help"];

test.describe("mobile — signed out", () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path} does not scroll sideways`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // scrollWidth beyond the viewport is the signature of a fixed width,
      // an unwrapped row or an image without a max-width. It is invisible
      // at desktop and immediately obvious to anyone holding a phone.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      // One pixel of slack for sub-pixel rounding at this width.
      expect(overflow, `${path} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("mobile — signed in", () => {
  test.skip(
    !HAVE_AUTH,
    "E2E_EMAIL / E2E_PASSWORD not set — the mobile logout checks are SKIPPED, not passed",
  );
  test.use({ storageState: AUTH_FILE });

  for (const path of AUTHED_PAGES) {
    test(`${path} offers a way to log out`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Visibility, not presence. B7's reproduction was that exactly one
      // "Log out" node existed in the DOM on each of these pages and it
      // reported visible:false on all of them — the desktop sidebar,
      // hidden by a breakpoint. Counting nodes would have passed.
      const logout = page.getByRole("button", { name: /log ?out/i });
      await expect(
        logout.first(),
        `no visible Log out control on ${path} at phone width`,
      ).toBeVisible();
    });
  }

  for (const path of AUTHED_PAGES) {
    test(`${path} does not scroll sideways`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(1);
    });
  }
});
