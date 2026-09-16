#!/usr/bin/env node
/**
 * Build the self-hosted Tabler icon subset in public/fonts/.
 *
 *   node scripts/build-icon-font.mjs
 *
 * Why this exists: the icon font used to load from cdn.jsdelivr.net as a
 * render-blocking stylesheet on every page. A blocked or slow CDN gave a
 * page of invisible icons — observed for real during development, not a
 * hypothetical. The full webfont is 770KB of woff2 plus a 201KB stylesheet
 * defining ~4900 icons, of which this app uses about 80, so shipping all of
 * it to fix that would have traded one problem for a worse one.
 *
 * RUN THIS AFTER ADDING AN ICON. The subset contains exactly the names the
 * source asks for; a name that is not in it renders as nothing at all, with
 * no error anywhere. `npm run check:icons` fails the build if the two drift.
 *
 * Requires (once):  pip install fonttools brotli
 *                   npm pack @tabler/icons-webfont@<TABLER_VERSION>
 *
 * Two things this deliberately does NOT do:
 *
 * 1. It does not guess. Names are collected from real call sites, including
 *    the `icon: "..."` constants that reach the DOM through `ti-${icon}`
 *    and would be invisible to a plain `ti-` grep.
 *
 * 2. It does not silently drop an unknown name. If the source asks for an
 *    icon the font has no glyph for, this exits non-zero and names it —
 *    which is how `ti-rosette-discount-check` (a Tabler 3.x name, on a 2.x
 *    pin) was caught after rendering nothing for months.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { execFileSync } from "node:child_process";

const TABLER_VERSION = "2.44.0";
const SRC_DIR = "src";
// The woff2 is a static asset; the stylesheet is imported by globals.css
// rather than <link>ed, which is what Next wants (no-css-tags) and what lets
// it be bundled with the rest of the CSS.
const FONT_DIR = join("public", "fonts");
const CSS_DIR = join("src", "styles");
const CSS_OUT = join(CSS_DIR, "tabler-subset.css");
const WOFF2_OUT = join(FONT_DIR, "tabler-subset.woff2");

/** Icon names the code needs but no call site spells out in full. */
const EXTRA = [
  // LiveStatusBanner builds `ti-chevron-${open ? "up" : "down"}`, so the
  // scan only ever sees the literal prefix "chevron-".
  "chevron-up",
  "chevron-down",
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if ([".ts", ".tsx"].includes(extname(entry.name))) out.push(p);
  }
  return out;
}

/** Every icon name the source asks for, however it spells it. */
export function collectNames(srcDir = SRC_DIR) {
  const names = new Set(EXTRA);
  for (const file of walk(srcDir)) {
    const text = readFileSync(file, "utf8");
    // 1. Literal `ti-foo` anywhere in a className.
    for (const m of text.matchAll(/\bti-([a-z0-9][a-z0-9-]*)/g)) names.add(m[1]);
    // 2. `icon: "foo"` / `icon: "ti-foo"` constants, consumed as `ti-${icon}`.
    //    nav-config.ts, site-links.ts, StoreBadges and notification-style all
    //    store the name without its prefix, so (1) never sees these.
    for (const m of text.matchAll(/icon:\s*"([a-z0-9][a-z0-9-]*)"/g)) {
      names.add(m[1].startsWith("ti-") ? m[1].slice(3) : m[1]);
    }
  }
  // A dynamic name leaves its literal prefix behind (e.g. "chevron-"); the
  // real values are listed in EXTRA.
  for (const n of [...names]) if (n.endsWith("-")) names.delete(n);
  return [...names].sort();
}

/** name -> codepoint, parsed from the upstream stylesheet. */
export function readGlyphMap(cssPath) {
  const lines = readFileSync(cssPath, "utf8").split(/\r?\n/);
  const map = new Map();
  for (let i = 0; i < lines.length; i++) {
    const sel = lines[i].trim();
    if (!sel.startsWith(".ti-") || !sel.endsWith(":before {")) continue;
    const name = sel.slice(4, -":before {".length);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) continue;
    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      const m = lines[j].trim().match(/^content:\s*"\\([0-9a-fA-F]+)";$/);
      if (m) {
        map.set(name, m[1].toLowerCase());
        break;
      }
    }
  }
  return map;
}

function main() {
  const pkg = process.argv[2];
  if (!pkg || !existsSync(pkg)) {
    console.error(
      `Usage: node scripts/build-icon-font.mjs <path to unpacked @tabler/icons-webfont@${TABLER_VERSION}>\n` +
        `  npm pack @tabler/icons-webfont@${TABLER_VERSION} && tar -xzf tabler-icons-webfont-${TABLER_VERSION}.tgz`,
    );
    process.exit(1);
  }

  const wanted = collectNames();
  const glyphs = readGlyphMap(join(pkg, "tabler-icons.css"));

  const missing = wanted.filter((n) => !glyphs.has(n));
  if (missing.length) {
    console.error(
      `\nThese icon names are used in ${SRC_DIR}/ but do not exist in Tabler ${TABLER_VERSION}:\n` +
        missing.map((n) => `  ti-${n}`).join("\n") +
        `\n\nThey render as nothing. Fix the name at the call site (or bump TABLER_VERSION).\n`,
    );
    process.exit(1);
  }

  const resolved = wanted.map((n) => [n, glyphs.get(n)]);
  mkdirSync(FONT_DIR, { recursive: true });
  mkdirSync(CSS_DIR, { recursive: true });

  // Subset the woff2 to just these codepoints.
  const unicodes = resolved.map(([, cp]) => `U+${cp}`).join(",");
  execFileSync(
    "python",
    [
      "-m",
      "fontTools.subset",
      join(pkg, "fonts", "tabler-icons.ttf"),
      `--unicodes=${unicodes}`,
      "--flavor=woff2",
      `--output-file=${WOFF2_OUT}`,
      "--no-hinting",
      "--desubroutinize",
      "--layout-features=",
    ],
    { stdio: "inherit" },
  );

  const rules = resolved.map(([n, cp]) => `.ti-${n}:before{content:"\\${cp}"}`).join("\n");
  writeFileSync(
    CSS_OUT,
    `/* Generated by scripts/build-icon-font.mjs — do not edit.\n` +
      `   Tabler Icons ${TABLER_VERSION} (MIT), subset to the ${resolved.length} icons this app uses.\n` +
      `   Re-run after adding an icon, or it will render as nothing. */\n` +
      `@font-face{font-family:"tabler-icons";font-style:normal;font-weight:400;` +
      `font-display:block;src:url("/fonts/tabler-subset.woff2") format("woff2")}\n` +
      `.ti{font-family:"tabler-icons"!important;font-style:normal;font-weight:400;font-variant:normal;` +
      `text-transform:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;` +
      `display:inline-block}\n` +
      rules +
      `\n`,
    "utf8",
  );

  console.log(`${resolved.length} icons -> ${WOFF2_OUT} + ${CSS_OUT}`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("build-icon-font.mjs")) {
  main();
}
