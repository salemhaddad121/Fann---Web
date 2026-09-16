#!/usr/bin/env node
/**
 * Fail if the code asks for an icon the shipped subset does not contain.
 *
 * The icon font is self-hosted and subset to what the app uses, so adding a
 * `ti-something-new` in a component without re-running the generator gives a
 * glyph that renders as NOTHING — no error, no warning, no console message,
 * on any page that uses it. That failure is silent in exactly the way this
 * repo's CLAUDE.md says to watch for, so it gets a check of its own.
 *
 * Fix a failure with:
 *   npm pack @tabler/icons-webfont@2.44.0 && tar -xzf tabler-icons-webfont-2.44.0.tgz
 *   node scripts/build-icon-font.mjs ./package
 */

import { readFileSync, existsSync } from "node:fs";
import { collectNames } from "./build-icon-font.mjs";

const CSS = "src/styles/tabler-subset.css";

if (!existsSync(CSS)) {
  console.error(`${CSS} is missing — run: node scripts/build-icon-font.mjs <unpacked tabler package>`);
  process.exit(1);
}

const css = readFileSync(CSS, "utf8");
const shipped = new Set([...css.matchAll(/\.ti-([a-z0-9][a-z0-9-]*):before/g)].map((m) => m[1]));
const wanted = collectNames();
const missing = wanted.filter((n) => !shipped.has(n));

if (missing.length) {
  console.error(
    `\n${missing.length} icon(s) used in src/ are not in the shipped subset — they will render as nothing:\n` +
      missing.map((n) => `  ti-${n}`).join("\n") +
      `\n\nRegenerate: node scripts/build-icon-font.mjs <unpacked tabler package>\n`,
  );
  process.exit(1);
}

const unused = [...shipped].filter((n) => !wanted.includes(n));
console.log(
  `icons: ${wanted.length} used, ${shipped.size} shipped` +
    (unused.length ? ` (${unused.length} shipped but unused — harmless, regenerate to trim)` : ""),
);
