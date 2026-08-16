/**
 * The URL contract for /search.
 *
 * The search page used to ignore its own query string entirely: every state
 * variable initialised empty, so `/search?categories=dj` rendered the same
 * unfiltered page as `/search`. That broke the footer's category links,
 * bookmarking, sharing, and anything that wants to link into a pre-filtered
 * search — which is most of the marketing surface.
 *
 * Everything here is pure so the round trip can be tested without rendering
 * the page. The rule the tests hold to: a URL must produce exactly the state
 * it describes, and that state must reproduce that URL.
 *
 * Only the filters worth sharing live in the URL — the free-text query, the
 * category or event-type selection, and the page. The finer filters (city,
 * price, verified-only, sort) deliberately stay out: they are refinements
 * someone makes after arriving, not things anyone links to.
 */

import type { CategoryGroup } from "@/types/artists";

/**
 * The read side only needs these two methods, which lets the tests pass a
 * plain URLSearchParams where the page passes Next's ReadonlyURLSearchParams.
 */
export interface ReadableSearchParams {
  get(name: string): string | null;
  getAll(name: string): string[];
}

export interface ArtistSearchUrl {
  q: string;
  categories: string[];
  page: number;
}

export interface PlannerSearchUrl {
  q: string;
  eventTypes: string[];
  page: number;
}

/**
 * How the category filter is held in the UI: one main group at a time, with
 * an optional subset of its leaves ticked. The URL carries a flat list of
 * slugs instead, because that is what a human writes and what a link from
 * elsewhere on the site can reasonably construct.
 */
export interface CategorySelection {
  group: string | null;
  subs: string[];
}

/**
 * A list parameter, accepting both `?x=a,b` and `?x=a&x=b`.
 *
 * Comma is what this app writes. Repeated keys are accepted because they are
 * the other obvious way to hand-write one, and rejecting them would fail for
 * no reason a reader could see.
 */
function readList(params: ReadableSearchParams, name: string): string[] {
  return params
    .getAll(name)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

/** Positive integers only; anything else is page 1. */
export function parsePage(raw: string | null): number {
  if (!raw) return 1;
  // Number() rather than parseInt so "2abc" is rejected instead of read as 2.
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return 1;
  return n;
}

export function readArtistSearchUrl(params: ReadableSearchParams): ArtistSearchUrl {
  return {
    q: (params.get("q") ?? "").trim(),
    categories: readList(params, "categories"),
    page: parsePage(params.get("page")),
  };
}

export function readPlannerSearchUrl(params: ReadableSearchParams): PlannerSearchUrl {
  return {
    q: (params.get("q") ?? "").trim(),
    eventTypes: readList(params, "eventTypes"),
    page: parsePage(params.get("page")),
  };
}

/**
 * Build the query string, omitting anything at its default.
 *
 * Key order is fixed so the result can be string-compared against the current
 * URL — that comparison is what stops the page writing a URL it just read and
 * looping.
 */
function buildQuery(entries: Array<[string, string | undefined]>): string {
  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

export function buildArtistSearchQuery(state: ArtistSearchUrl): string {
  return buildQuery([
    ["q", state.q.trim() || undefined],
    ["categories", state.categories.length ? state.categories.join(",") : undefined],
    ["page", state.page > 1 ? String(state.page) : undefined],
  ]);
}

export function buildPlannerSearchQuery(state: PlannerSearchUrl): string {
  return buildQuery([
    ["q", state.q.trim() || undefined],
    ["eventTypes", state.eventTypes.length ? state.eventTypes.join(",") : undefined],
    ["page", state.page > 1 ? String(state.page) : undefined],
  ]);
}

/**
 * Turn the URL's flat slug list into the group/subs pair the filter UI holds.
 *
 * A slug may name a whole group ("music") or a leaf ("band-group"); a leaf
 * implies its parent group, which is how `/search?categories=band-group` from
 * the footer lands with Music open and Band / Group ticked.
 *
 * Unknown slugs are dropped rather than passed to the API, so a stale
 * bookmark degrades to a broader search instead of an error. Leaves from more
 * than one group are narrowed to the first group seen: the filter can only
 * show one group at a time, so there is no state that could represent the
 * rest, and silently sending them would put the URL and the UI out of step.
 */
export function resolveCategorySelection(
  groups: CategoryGroup[],
  slugs: string[],
): CategorySelection {
  if (slugs.length === 0 || groups.length === 0) return { group: null, subs: [] };

  for (const slug of slugs) {
    const asGroup = groups.find((g) => g.slug === slug);
    if (asGroup) return { group: asGroup.slug, subs: [] };

    const parent = groups.find((g) => g.categories.some((c) => c.slug === slug));
    if (!parent) continue;

    const known = new Set(parent.categories.map((c) => c.slug));
    // Dedupe while preserving the order the URL gave them.
    const subs = [...new Set(slugs.filter((s) => known.has(s)))];
    return { group: parent.slug, subs };
  }

  return { group: null, subs: [] };
}

/**
 * The inverse: what the URL should say for a given selection.
 *
 * Ticked leaves win; a group with nothing ticked is written as the group slug
 * rather than as all of its leaves, which keeps the URL short and keeps the
 * round trip exact.
 */
export function selectionToUrlSlugs(selection: CategorySelection): string[] {
  if (selection.subs.length > 0) return selection.subs;
  if (selection.group) return [selection.group];
  return [];
}

/**
 * What the *API* is asked for, which is not the same list.
 *
 * The search endpoint only understands leaves, so a group with nothing ticked
 * expands to every leaf under it. The URL keeps saying "music" while the
 * request says all ten music slugs.
 */
export function apiCategorySlugs(
  groups: CategoryGroup[],
  selection: CategorySelection,
): string[] {
  const active = groups.find((g) => g.slug === selection.group);
  if (!active) return [];
  if (selection.subs.length > 0) return selection.subs;
  return active.categories.map((c) => c.slug);
}

/** Event types are free text from the API, so validate by membership. */
export function validateEventTypes(available: string[], requested: string[]): string[] {
  if (available.length === 0) return [];
  const known = new Set(available);
  return [...new Set(requested.filter((t) => known.has(t)))];
}
