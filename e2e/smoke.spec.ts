import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { AUTH_FILE } from "./paths";

/**
 * The gate a batch of changes has to pass before it is called done.
 *
 * Three questions per page, none of which typecheck or lint can answer:
 *   loads clean      does it render without console errors or failed requests?
 *   links resolve    does every link on it lead to a page that exists?
 *   controls respond does every button actually do something when clicked?
 *
 * The third is the one that catches a button wired to nothing — it renders,
 * it hovers, it has the right label, and clicking it changes neither the URL,
 * nor the DOM, nor the network.
 */

const ROUTES_FILE = "e2e/routes.json";
if (!existsSync(ROUTES_FILE)) {
  throw new Error(`${ROUTES_FILE} missing — run: node scripts/check-dead-ends.mjs`);
}

interface RouteEntry {
  route: string;
  dynamic: boolean;
  file: string;
}

const ALL: RouteEntry[] = JSON.parse(readFileSync(ROUTES_FILE, "utf8"));

// Seed ids for the dynamic routes, e.g. { "/artists/[id]": "/artists/seed-artist-1" }.
// Without it those routes are reported as skipped rather than silently dropped.
const SEEDS: Record<string, string> = existsSync("e2e/seeds.json")
  ? JSON.parse(readFileSync("e2e/seeds.json", "utf8"))
  : {};

// Pages that need a session but sit OUTSIDE the (app) route group, so the
// file-path heuristic below cannot see them. /messages/[id] renders AppShell
// itself in order to drop the mobile BottomNav — the composer owns the bottom
// of the screen there — which is why it lives outside the group.
//
// Getting this wrong is quiet in the worst way: the route is visited signed
// out, the page redirects, and every API call behind it 401s while the run
// reports the page as tested.
const AUTHED_OUTSIDE_APP_GROUP = [/^\/messages\/\[id\]$/];

const AUTHED = (r: RouteEntry) =>
  r.file.includes("/(app)/") || AUTHED_OUTSIDE_APP_GROUP.some((re) => re.test(r.route));
const HAVE_AUTH = existsSync(AUTH_FILE);

// Console messages and responses that are noise rather than defects.
// Keep this list short and justified — every entry is a check you turned off.
const IGNORE = [
  /favicon\.ico/, // Next serves none in dev
  /\/sw\.js/, // service worker registration is exercised separately
  /Download the React DevTools/,

  // A signed-out visitor's session probe. Sessions live in httpOnly cookies,
  // so the only way to find out whether one exists is to ask — GET /auth/me
  // 401s, apiFetch tries POST /auth/refresh, that 401s too, and the browser
  // logs both. It happens on every public page and is correct behaviour, not
  // a defect.
  //
  // Matched by URL, so a 401 from any OTHER endpoint still fails the run.
  /\/auth\/(me|refresh)(\?|$)/,

  // Telemetry, rate limited to 30/min per IP and fired on every page
  // load — so this suite exhausts it for the same reason it exhausts the
  // refresh budget. A dropped page-view beacon has no user-visible
  // effect, which is why it is fire-and-forget in the app too.
  /\/analytics\/page-views/,

  // The console half of the same thing. Chrome's message for a failed
  // subresource carries no URL — "Failed to load resource: the server
  // responded with a status of 401 (Unauthorized)" is all there is — so it
  // cannot be scoped the way the response check above is. Suppressing it
  // here loses nothing: the response listener sees every one of these WITH
  // its URL and is what actually enforces the rule.
  /status of 401 \(Unauthorized\)/,

  // 429 on the same endpoint, for the same reason one step further on.
  // POST /auth/refresh is rate limited to 30/min per IP, and this suite
  // makes one of those per page load: ~140 page loads in a run will exhaust
  // it no matter how few workers are used. Verified by running the failing
  // routes on their own, where all of them pass.
  //
  // That is the suite outrunning a limit that exists on purpose, not a
  // defect, and the production limit is not something to relax to make a
  // test green. Scoped to the refresh endpoint, so a 429 anywhere else
  // still fails the run.
  /status of 429 \(Too Many Requests\)/,
];
const noise = (s: string) => IGNORE.some((re) => re.test(s));

// Buttons whose click has consequences a smoke run must not cause.
const DESTRUCTIVE =
  /delete|remove|cancel|log ?out|sign ?out|pay|purchase|subscribe|upgrade|confirm|submit|send|block|report|withdraw|decline|accept|unsave|deactivate|reject|approve/i;

const MAX_BUTTONS_PER_PAGE = 12;

// Next's development overlay is injected into every page by the dev server.
// It is not the application, and its controls are not ours to assert on.
const DEV_OVERLAY = /next\.?js dev tools/i;

/** The routes this run can actually visit. */
const visitable = ALL.flatMap((r) => {
  if (!r.dynamic) return [{ ...r, url: r.route }];
  const seed = SEEDS[r.route];
  return seed ? [{ ...r, url: seed }] : [];
});

const skippedDynamic = ALL.filter((r) => r.dynamic && !SEEDS[r.route]);

test.describe("coverage", () => {
  test("every route is either visited or explicitly unverified", async () => {
    // Not an assertion so much as a report: a green suite that silently
    // covered half the app is worse than a red one.
    const authedUnverified = HAVE_AUTH ? [] : ALL.filter(AUTHED).map((r) => r.route);
    console.log(
      [
        `routes total:      ${ALL.length}`,
        `visited:           ${visitable.length - (HAVE_AUTH ? 0 : authedUnverified.length)}`,
        `dynamic, no seed:  ${skippedDynamic.map((r) => r.route).join(", ") || "none"}`,
        `behind auth, unverified: ${authedUnverified.join(", ") || "none"}`,
      ].join("\n")
    );
    expect(visitable.length).toBeGreaterThan(0);
  });
});

for (const r of visitable) {
  test.describe(r.url, () => {
    test.skip(AUTHED(r) && !HAVE_AUTH, "behind auth — set E2E_EMAIL / E2E_PASSWORD");
    test.use(AUTHED(r) && HAVE_AUTH ? { storageState: AUTH_FILE } : {});

    test("loads clean", async ({ page }) => {
      const errors: string[] = [];
      const failed: string[] = [];

      page.on("console", (m) => {
        if (m.type() === "error" && !noise(m.text())) errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("response", (res) => {
        if (res.status() >= 400 && !noise(res.url())) failed.push(`${res.status()} ${res.url()}`);
      });

      const resp = await page.goto(r.url, { waitUntil: "load" });
      await page.waitForLoadState("networkidle").catch(() => {});

      expect(resp?.status(), `${r.url} returned HTTP ${resp?.status()}`).toBeLessThan(400);
      expect(errors, `console errors on ${r.url}`).toEqual([]);
      expect(failed, `failed requests on ${r.url}`).toEqual([]);
    });

    test("links resolve", async ({ page }) => {
      await page.goto(r.url, { waitUntil: "load" });

      const hrefs = await page.$$eval("a[href]", (as) =>
        as.map((a) => a.getAttribute("href") ?? "")
      );
      const internal = [
        ...new Set(
          hrefs.filter((h) => h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/#"))
        ),
      ];

      const broken: string[] = [];
      for (const href of internal) {
        // page.request shares the browser context's cookies, so authed links
        // are followed as the logged-in user rather than as an anonymous one.
        const res = await page.request.get(href, { failOnStatusCode: false });
        if (res.status() >= 400) broken.push(`${href} -> HTTP ${res.status()}`);
      }

      expect(broken, `dead links on ${r.url}`).toEqual([]);
    });

    test("controls respond", async ({ page }) => {
      await page.goto(r.url, { waitUntil: "load" });
      await page.waitForLoadState("networkidle").catch(() => {});

      const names = await page.getByRole("button").evaluateAll((els) =>
        els.map((el) => ({
          name: (el.textContent ?? "").trim() || el.getAttribute("aria-label") || "",
          disabled: (el as HTMLButtonElement).disabled,
          submit: el.getAttribute("type") === "submit",
          // A toggle that is already on. Clicking it is CORRECTLY a no-op —
          // the role picker on /auth/register is a radio group, and
          // re-selecting the selected option must not change anything. Without
          // this the suite reports the one button behaving properly as dead.
          pressed:
            el.getAttribute("aria-pressed") === "true" ||
            el.getAttribute("aria-selected") === "true",
        }))
      );

      const candidates = names
        .map((b, index) => ({ ...b, index }))
        .filter(
          (b) =>
            !b.disabled &&
            !b.submit &&
            !b.pressed &&
            b.name &&
            !DESTRUCTIVE.test(b.name) &&
            !DEV_OVERLAY.test(b.name)
        )
        .slice(0, MAX_BUTTONS_PER_PAGE);

      const inert: string[] = [];

      for (const b of candidates) {
        await page.goto(r.url, { waitUntil: "load" });

        // Only structural mutations count. Class and style changes are excluded
        // on purpose: a focus ring is not evidence that a button does anything.
        await page.evaluate(() => {
          (window as unknown as { __fx: { mutations: number } }).__fx = { mutations: 0 };
          new MutationObserver((records) => {
            (window as unknown as { __fx: { mutations: number } }).__fx.mutations += records.length;
          }).observe(document.body, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["aria-expanded", "aria-selected", "aria-hidden", "data-state", "open", "hidden"],
          });
        });

        let requests = 0;
        const count = () => (requests += 1);
        page.on("request", count);

        const before = page.url();
        const button = page.getByRole("button").nth(b.index);
        await button.click({ timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(400);

        page.off("request", count);

        const moved = page.url() !== before;
        const mutations = await page
          .evaluate(() => (window as unknown as { __fx: { mutations: number } }).__fx.mutations)
          .catch(() => 1); // a navigation tore down the context, which counts as movement

        if (!moved && mutations === 0 && requests === 0) inert.push(b.name);
      }

      expect(inert, `buttons on ${r.url} that do nothing when clicked`).toEqual([]);
    });
  });
}
