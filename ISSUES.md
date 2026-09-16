# Known issues

Found during other work and deliberately not fixed inline — see CLAUDE.md §2.
Each line: `file:line` — what is wrong. Delete a line when it is fixed.

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
