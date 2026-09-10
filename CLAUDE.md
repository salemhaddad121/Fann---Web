# Working rules for this repo

Read this before starting a batch of changes. It exists because the failure
mode here is not a crash — it is a page that renders perfectly with a button
that leads nowhere, and neither `tsc` nor `eslint` will ever tell you.

## 0. First-time setup

The e2e suite needs a browser binary, which is not in `node_modules`. Once, on
Windows, in this folder:

```bash
npm install
npx playwright install chromium
```

`npx playwright install chromium` downloads the browser itself, which npm does
not fetch — without it `npm run test:e2e` fails at launch rather than at a
test.

(The lockfile note that used to be here is gone: `package-lock.json` was
regenerated and committed on 2026-09-09, so `npm ci` is enough for the
packages. The browser download is still a separate step.)

## 1. Batch discipline

1. Branch before starting: `git switch -c batch/<short-name>`. Never work a
   batch directly on `main`.
2. Maximum 10 files per batch. If the work is larger, split it — a batch you
   cannot review in one sitting is a batch that ships a dead button.
3. One commit per item, with the item's name in the message. If item 6 of 9
   broke something, `git bisect` should find it in three steps.

## 2. When you find an unrelated problem

You will. Mid-batch you will notice a dead link, a swallowed error, a stale
prop. **Do not fix it.**

1. Append one line to `ISSUES.md`: `` `path/to/file.tsx:LINE` — what is wrong ``
2. Carry on with the batch you were asked to do.
3. Report the additions at the end so they can be triaged and scoped.

Fixing found issues inline is how a 6-file batch becomes a 30-file diff that
nobody reviews, and how the original task ends up half-finished. Logging it
costs one line and loses nothing.

The only exception: the issue makes the assigned work impossible to complete.
Then stop, say so, and wait — do not improvise around it.

## 3. Definition of done

A batch is not done until every one of these passes. Run them; do not assume.

```bash
npm run verify
```

which is, in order:

| # | Command | Catches |
|---|---------|---------|
| 1 | `npm run lint` | style and obvious mistakes |
| 2 | `npm run typecheck` | type breakage across the batch |
| 3 | `npm run check:dead-ends` | links to routes that do not exist, empty handlers, API calls with no matching Nest route |
| 4 | `npm run test` | unit tests (vitest) |
| 5 | `npm run test:e2e` | every page loads clean, every link resolves, every button does something |

Steps 3 and 5 are the ones that catch dead buttons. Do not skip them because
"the change was small" — a one-line change to a route name is exactly the
change that breaks six links.

### Running the e2e suite properly

```bash
# public routes only — authed pages report as SKIPPED, not passed
npm run test:e2e

# full coverage: log in first, and seed the dynamic routes
cp e2e/seeds.example.json e2e/seeds.json   # then fill in real ids
E2E_EMAIL=... E2E_PASSWORD=... npm run test:e2e
```

A green run with `behind auth, unverified: ...` in the output is **not** a
green run for those pages. Say so in the report rather than calling it clean.

## 4. Reporting

Report a batch as a table, one row per item, with evidence:

| Item | Status | Evidence |
|------|--------|----------|
| Rename `/login` to `/auth/login` | done | `npm run verify` green, 44/44 routes |
| Update booking card | partial | typecheck green, e2e skipped — no seed id |

Rules for that table:

- `done` requires a command you actually ran and its result. "Looks correct"
  is not evidence. "I updated the file" is not evidence.
- `partial` and `blocked` are acceptable answers. Reporting nine done and one
  blocked is useful. Reporting ten done when one is broken destroys trust in
  the other nine.
- If a check was skipped, name the check and why. Never let a skipped check
  read as a passed one.

## 5. Conventions that already exist here — do not "fix" them

- `src/lib/site-links.ts` uses `href: null` to mean "planned, not built". Those
  render as plain text on purpose. Do not turn them into links to a 404.
- `src/lib/nav-config.ts` is the single source of truth for the sidebar and
  bottom nav. Add destinations there, not in JSX.
- The API base URL already includes `/api/v1`. Paths passed to `apiFetch` are
  relative to it — `/auth/login`, not `/api/v1/auth/login`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
