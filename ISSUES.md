# Known issues

Found during other work and deliberately not fixed inline — see CLAUDE.md §2.
Each line: `file:line` — what is wrong. Delete a line when it is fixed.

- **Item 23 of the UX review (dashboard) is not done, and needs a decision.**
  The spec offers two routes: fill the planner dashboard (recent activity,
  saved artists, suggested artists) or constrain and centre the column. The
  column is already `mx-auto max-w-lg lg:max-w-3xl` — but that is the code
  the reviewer was looking at when they wrote the item, so it is not an
  answer to it. Filling it is the live question, and it overlaps work that
  was deliberately held: the Option-3 bento artist dashboard on
  `feat/artist-dashboard`, kept out of a merge on 2026-07-25 for a named
  future "Dashboard Premium" task. Building activity tiles now would either
  duplicate or conflict with that. Left untouched on purpose rather than
  improvised around; the cheapest resolution may be to record a deliberate
  skip. `src/app/(app)/dashboard/page.tsx` is unchanged from f4bc369.
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
