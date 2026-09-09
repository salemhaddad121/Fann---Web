#!/usr/bin/env node
/**
 * Static dead-end sweep.
 *
 * Catches the class of defect that a batch of agent edits leaves behind and
 * that neither tsc nor eslint will ever see: a control that renders fine and
 * goes nowhere. Three checks, no dependencies, runs in about a second:
 *
 *   1. LINKS   every navigation target in the source vs every route that
 *              actually exists. Anything linked but not routed is a dead button.
 *   2. MARKERS href="#", empty handlers, swallowed errors, TODO/placeholder
 *              text that reached the UI.
 *   3. API     every path the web app calls vs every route the Nest API
 *              declares. A button wired to an endpoint that does not exist
 *              looks identical to a working one until it is clicked.
 *
 * Usage:  node scripts/check-dead-ends.mjs [--strict] [--json]
 * Exit:   1 on any error, or on any warning when --strict is passed.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { getRoutes, routeExists, walk } from "./routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const APP = join(SRC, "app");
const API_REPO = resolve(ROOT, "..", "fann-api");

const STRICT = process.argv.includes("--strict");
const AS_JSON = process.argv.includes("--json");
// Writes e2e/routes.json and exits 0 without reporting. Used by pretest:e2e so
// a dead link does not block you from running the suite that explains it.
const EMIT_ONLY = process.argv.includes("--emit-only");

const findings = [];
const record = (level, check, file, line, message, detail) =>
  findings.push({ level, check, file: relative(ROOT, file).replace(/\\/g, "/"), line, message, detail });

/* ------------------------------------------------------------------ */
/* 1. LINKS — navigation targets vs real routes                        */
/* ------------------------------------------------------------------ */

const LINK_PATTERNS = [
  // href="/x"   href='/x'   href={"/x"}   href={`/artists/${id}`}
  { re: /href=\{?\s*["'`]([^"'`]*)["'`]\s*\}?/g, kind: "href" },
  // href: "/x"  — config objects (nav-config.ts, site-links.ts)
  { re: /href:\s*["'`]([^"'`]*)["'`]/g, kind: "config" },
  // router.push("/x")  router.replace("/x")  redirect("/x")
  { re: /(?:router\.(?:push|replace)|redirect)\(\s*["'`]([^"'`]*)["'`]/g, kind: "navigation" },
];

const isExternal = (t) =>
  /^(https?:)?\/\//.test(t) || /^(mailto|tel|sms|data|blob|javascript):/i.test(t);

const SENTINEL = "\u0000";

/**
 * A template literal has to be reduced to something checkable. `${...}` is
 * replaced by a sentinel, then two readings are produced, because a hole can
 * mean either of two things and the source does not say which:
 *
 *   `/artists/${id}`             -> /artists/__X__        a whole dynamic segment
 *   `/admin/verifications${qs}`  -> /admin/verifications  a query string appended
 *
 * The target passes if EITHER reading resolves. That is deliberate: the point
 * of the check is to surface links that cannot possibly work, not to guess at
 * the ones that can.
 *
 * Returns null when the target is not checkable at all — an interpolated base
 * URL (`${API_URL}/auth/google`) is an absolute external address, not a route.
 */
function expand(raw) {
  const trimmed = raw.trim();
  if (!trimmed || isExternal(trimmed)) return null;
  if (trimmed.startsWith("${")) return null; // computed base URL

  const marked = trimmed.replace(/\$\{[^}]*\}/g, SENTINEL).split("?")[0].split("#")[0];
  if (!marked.includes(SENTINEL)) return [marked];

  const asSegment = marked
    .split("/")
    .map((s) => (s.includes(SENTINEL) ? "__X__" : s))
    .join("/");
  const asSuffix = marked.split(SENTINEL)[0].replace(/\/$/, "");

  return [asSegment, asSuffix].filter(Boolean);
}

const routes = getRoutes(APP);
const sourceFiles = walk(SRC).filter((f) => /\.(tsx?|jsx?)$/.test(f) && !/\.test\.tsx?$/.test(f));

for (const file of sourceFiles) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((text, i) => {
    const lineNo = i + 1;
    for (const { re, kind } of LINK_PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        const raw = m[1].trim();
        if (!raw || raw === "#") continue;
        const targets = expand(raw);
        if (!targets) continue;
        if (!targets[0].startsWith("/")) {
          record("warn", "links", file, lineNo, `relative ${kind} target "${raw}" — cannot be verified statically`);
          continue;
        }
        if (!targets.some((t) => routeExists(t, routes))) {
          record("error", "links", file, lineNo, `${kind} points at "${raw}" — no such route`, targets.join("  or  "));
        }
      }
    }
  });
}

/* ------------------------------------------------------------------ */
/* 2. MARKERS — controls that render but do nothing                    */
/* ------------------------------------------------------------------ */

const MARKERS = [
  { re: /href=\{?\s*["'`]#["'`]/, level: "error", msg: 'href="#" — link goes nowhere' },
  { re: /href=\{?\s*["'`]\s*["'`]\s*\}?/, level: "error", msg: "empty href — link goes nowhere" },
  { re: /href=\{?\s*["'`]javascript:/i, level: "error", msg: "javascript: href" },
  { re: /on[A-Z]\w*=\{\s*\(\s*[^)]*\)\s*=>\s*\{\s*\}\s*\}/, level: "error", msg: "empty event handler — control does nothing when used" },
  { re: /on[A-Z]\w*=\{\s*\(\s*[^)]*\)\s*=>\s*(?:null|undefined|void 0)\s*\}/, level: "error", msg: "no-op event handler" },
  { re: /catch\s*(?:\([^)]*\))?\s*\{\s*\}/, level: "warn", msg: "empty catch — a failure here is silent" },
  { re: /\b(TODO|FIXME|XXX|HACK)\b/, level: "warn", msg: "unfinished-work marker" },
  { re: /(not implemented|coming soon|under construction)/i, level: "warn", msg: "placeholder copy — check it is not user-visible" },
];

for (const file of sourceFiles) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((text, i) => {
    for (const { re, level, msg } of MARKERS) {
      if (re.test(text)) record(level, "markers", file, i + 1, msg, text.trim().slice(0, 120));
    }
  });
}

/* ------------------------------------------------------------------ */
/* 3. API — called paths vs declared Nest routes                       */
/* ------------------------------------------------------------------ */

function nestRoutes(apiSrc) {
  const declared = [];
  const controllers = walk(apiSrc).filter((f) => /\.controller\.ts$/.test(f));
  for (const file of controllers) {
    const body = readFileSync(file, "utf8");
    const base = body.match(/@Controller\(\s*["'`]?([^"'`)]*)["'`]?\s*\)/);
    const prefix = base && base[1] ? "/" + base[1].replace(/^\/|\/$/g, "") : "";
    const verb = /@(Get|Post|Put|Patch|Delete)\(\s*(?:["'`]([^"'`]*)["'`])?\s*\)/g;
    let m;
    while ((m = verb.exec(body)) !== null) {
      const sub = (m[2] || "").replace(/^\/|\/$/g, "");
      declared.push({ path: prefix + (sub ? "/" + sub : ""), file });
    }
  }
  return declared;
}

const apiPathToRegex = (p) =>
  new RegExp(
    "^" +
      p
        .split("/")
        .map((s) => (s.startsWith(":") ? "[^/]+" : s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
        .join("/") +
      "/?$"
  );

if (existsSync(join(API_REPO, "src"))) {
  const declared = nestRoutes(join(API_REPO, "src"));
  const matchers = declared.map((d) => ({ ...d, re: apiPathToRegex(d.path) }));
  const CALL = /apiFetch(?:<[^>]*>)?\(\s*["'`]([^"'`]+)["'`]/g;

  for (const file of sourceFiles) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((text, i) => {
      CALL.lastIndex = 0;
      let m;
      while ((m = CALL.exec(text)) !== null) {
        const paths = expand(m[1]);
        if (!paths || !paths[0].startsWith("/")) continue;
        if (!paths.some((p) => matchers.some((d) => d.re.test(p)))) {
          record("error", "api", file, i + 1, `calls "${m[1]}" — no Nest route declares it`, paths.join("  or  "));
        }
      }
    });
  }
} else {
  record("warn", "api", ROOT, 0, `fann-api not found at ${API_REPO} — API path check skipped`);
}

/* ------------------------------------------------------------------ */
/* Emit the route list for the smoke test, then report                 */
/* ------------------------------------------------------------------ */

mkdirSync(join(ROOT, "e2e"), { recursive: true });
writeFileSync(join(ROOT, "e2e", "routes.json"), JSON.stringify(routes, null, 2) + "\n");

if (EMIT_ONLY) {
  console.log(`e2e/routes.json written (${routes.length} routes).`);
  process.exit(0);
}

const errors = findings.filter((f) => f.level === "error");
const warnings = findings.filter((f) => f.level === "warn");

if (AS_JSON) {
  console.log(JSON.stringify({ routes: routes.length, errors, warnings }, null, 2));
} else {
  const groups = { links: "DEAD LINKS", markers: "DEAD-END MARKERS", api: "MISSING API ROUTES" };
  for (const [key, title] of Object.entries(groups)) {
    const hits = findings.filter((f) => f.check === key);
    if (!hits.length) continue;
    console.log("\n" + title + "  (" + hits.length + ")");
    console.log("-".repeat(title.length + 8));
    for (const f of hits) {
      const tag = f.level === "error" ? "ERROR" : "warn ";
      console.log(`${tag}  ${f.file}:${f.line}  ${f.message}`);
      if (f.detail) console.log(`         ${f.detail}`);
    }
  }
  console.log(
    `\n${routes.length} routes scanned, ${sourceFiles.length} source files. ` +
      `${errors.length} error(s), ${warnings.length} warning(s).`
  );
  console.log("e2e/routes.json written.\n");
}

process.exit(errors.length || (STRICT && warnings.length) ? 1 : 0);
