/**
 * Route inventory for the Fann web app — the single source of truth shared by
 * scripts/check-dead-ends.mjs and the Playwright smoke test.
 *
 * Nothing here imports from the app itself, so it stays runnable with plain
 * `node` and never drags Next's build into a verification step.
 */

import { readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";

const IGNORED_DIRS = new Set(["node_modules", ".next", ".git", "coverage", "test-results"]);

/** Every file under `dir`, recursively, skipping build and vendor directories. */
export function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/**
 * An App Router directory path becomes a URL path:
 *   (app)/dashboard      -> /dashboard      route groups drop out entirely
 *   artists/[id]         -> /artists/[id]   dynamic segments are kept verbatim
 *   @modal/...           -> skipped         parallel routes are not navigable
 */
function dirToRoute(relDir) {
  const segments = relDir
    .split(sep)
    .filter(Boolean)
    .filter((s) => !(s.startsWith("(") && s.endsWith(")")))
    .filter((s) => !s.startsWith("@"))
    .filter((s) => !s.startsWith("_"));
  return "/" + segments.join("/");
}

/**
 * Turn a route pattern into a matcher. `[id]` accepts one segment,
 * `[...slug]` accepts the rest of the path.
 */
export function routeToRegex(route) {
  const source = route
    .split("/")
    .map((seg) => {
      if (/^\[\.\.\..+\]$/.test(seg)) return ".+";
      if (/^\[.+\]$/.test(seg)) return "[^/]+";
      return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return new RegExp("^" + source + "/?$");
}

/**
 * Every page route in the app.
 * Returns { route, dynamic, file } — `dynamic` routes need a seed id before
 * the smoke test can visit them, so it is reported rather than guessed.
 */
export function getRoutes(appDir) {
  const routes = [];
  for (const file of walk(appDir)) {
    if (!/[\\/]page\.tsx?$/.test(file)) continue;
    const relDir = file.slice(appDir.length).replace(/[\\/]page\.tsx?$/, "");
    const route = dirToRoute(relDir);
    routes.push({
      route,
      dynamic: route.includes("["),
      file: file.replace(/\\/g, "/"),
    });
  }
  return routes.sort((a, b) => a.route.localeCompare(b.route));
}

/** True when `target` is served by one of `routes`. */
export function routeExists(target, routes) {
  return routes.some((r) => routeToRegex(r.route).test(target));
}
