# Known issues

Found during other work and deliberately not fixed inline — see CLAUDE.md §2.
Each line: `file:line` — what is wrong. Delete a line when it is fixed.

- `scripts/check-dead-ends.mjs` — reports
  `src/app/layout.tsx:94 href points at "/fonts/tabler-subset.woff2" — no
  such route`. False positive: that is a `<link rel="preload" as="font">`,
  not a navigation, and `public/fonts/tabler-subset.woff2` is present. The
  checker treats every `href` as a route. Introduced by 82dd6d5 (self-host
  the icon font), and it makes `npm run verify` red on `main` for anyone
  who runs it. Probably one condition: skip `<link>` elements, or skip an
  href with a file extension.
- `playwright.config.ts` — the local default of 4 workers makes "links
  resolve" flaky against `next dev`. That test does a sequential
  `page.request.get()` for every internal link on a page (the footer alone
  is ~30), and four workers doing that at once starve the dev server until
  the 30s test timeout fires. The failures are pure timeouts with no HTTP
  status, they move to a different route each run, and every one of them
  passes in isolation. `--workers=2` (what CI already uses) is reliably
  green: 146/146. Either lower the local default or raise the timeout for
  that test.
- `src/components/profile/LockedField.tsx:~130` — UnlockCta's button says
  "from $5" as a literal. It renders on every locked profile view, so it is
  not worth a plan-list request for one number, but it will be wrong the day
  the day-pass price changes. Either accept the coupling or thread the price
  down from a caller that already has the plans.
- `src/components/search/SearchFilters.tsx` — the City field fires a search
  per keystroke (no debounce), unlike the text query, which is debounced at
  400ms in SearchClient. Pre-existing, but the mobile filter sheet now shows
  a live result count, which makes it much more visible.
- `src/lib/api.ts:100` — `return res.json()` on the success path is
  unguarded, so a 200 with an empty or truncated body throws a raw
  `SyntaxError: Unexpected end of JSON input` instead of an `ApiError`. The
  failure path five lines above already try/catches exactly this. It shows up
  as an intermittent **HTTP 500 on the archived legal pages**
  (`/privacy/2026-08-11`, `/terms/2026-08-11`) during a full e2e run, which
  is how it was found — those pages are statically generated and make no API
  call of their own, so the throw is coming from the provider in the root
  layout. Pre-existing: reproduced on `f4bc369` before any of the UX work.
  Worth fixing properly, because a legal page that 500s is the one page that
  has to resolve.
- `src/components/plans/PlanCards.tsx:~250` — the `ctaHref` prop and its
  `{!onChoose && ctaHref && ...}` branch now have no caller. The landing page
  was the only one, and item 6 replaced it with a summary block. Either
  delete the prop or leave it as supported component API — a decision, not a
  defect, so it is logged rather than taken.

Decided 2026-09-16:

- **UX review item 23 (fill or constrain the planner dashboard) — skipped,
  deliberately.** Salem's call. The activity tiles the item asks for are
  already built on `feat/artist-dashboard` and parked for the "Dashboard
  Premium" task; a second set here would duplicate or collide with them. The
  column stays as it is. Recorded in the review file's own "Decisions taken"
  section and in a comment on `src/app/(app)/dashboard/page.tsx`, so it is
  not rediscovered as an oversight.

Resolved 2026-09-09:

- `src/lib/auth-context.tsx:70` — logout pushed to `/login`, which does not
  exist, so every logout landed on a 404. Now `/auth/login`.
- `SubscriptionSection.tsx:43`, `VerificationChecklist.tsx:131` — `void load()`
  in a `useEffect` body tripped `react-hooks/set-state-in-effect`. Both now
  fetch in the effect and set state in the promise callback, with a cancelled
  guard.
- `e2e/*.ts` "Module '@playwright/test' has no exported member 'test'" — this
  was never real. `@playwright/test` was mid-install when it was first
  observed, so `playwright/types/test.d.ts` did not yet exist; the same install
  had also left `node_modules/.bin` without the playwright shims, which is why
  `npm run test:e2e` could not start either. `npm install` fixed both.
  Do not go looking for a tsconfig cause — there isn't one.
