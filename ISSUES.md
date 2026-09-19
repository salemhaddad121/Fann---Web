# Known issues

Found during other work and deliberately not fixed inline — see CLAUDE.md §2.
Each line: `file:line` — what is wrong. Delete a line when it is fixed.

- `src/components/landing/BrowseCategories.tsx` — the Event Services card
  links to `/search?categories=food-beverage`, which returns **0 artists** on
  the current roster. Measured per-group totals today: music 4, visual 1,
  performance-entertainment 1, production-technical 1, and venues-spaces,
  food-beverage, speciality and other all 0, out of 7 artists. The card is
  shipped as the plan specifies it — the categories are real and the plan
  accepts the group search as the destination ("they would be empty at the
  current roster") — but on a marketing page a door onto an empty room is
  worth a decision: either seed a caterer/bartender, or repoint the card at
  `visual` (Photographers, Videographers, Photo Booth, 360 Video Booth, Drone
  Operator), which has an artist and covers two of the plan's own six tags for
  that card. One line either way. The bartender thumbnail belongs to the
  food-beverage reading of the card, so repointing it needs a new image.

- `src/lib/search-url.ts` — `resolveCategorySelection` returns `{group, subs}`
  and so can hold exactly ONE group. A URL naming leaves from several groups
  silently keeps the first group's leaves and drops the rest: twelve leaves
  across food-beverage, visual and production-technical resolve to Food &
  Beverage alone and render "0 artists match your filters" with no hint that
  nine of the twelve filters were discarded. That is a deliberate model (it is
  what the chip UI can express, and it is unit-tested), but it is silent —
  either document it at the function or drop unrepresentable slugs loudly.
  It is why each browse card links to one group rather than to a set.

- `src/app/search/SearchClient.tsx` — the result count does not pluralise its
  verb: a single match reads "1 artist match your filters". The noun is
  handled, the verb is not.

- `src/components/brand/FannMark.tsx` — `FannMark` and `FannWordmark` are now
  thin aliases of `FannLockup`, and `textClassName` / `withDots` / `onInk`
  are accepted and ignored. Nothing passes them any more and nothing imports
  the two aliases, so all five can be deleted. Left in place so the wordmark
  swap did not also have to be an API change; delete when convenient.
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
