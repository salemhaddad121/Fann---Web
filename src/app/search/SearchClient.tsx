"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { GuestChrome } from "@/components/shell/GuestChrome";
import { searchArtists, getCategories } from "@/lib/artists-api";
import { searchPlanners, getEventTypes } from "@/lib/planners-api";
import { listSavedArtistIds, saveArtist, unsaveArtist } from "@/lib/saved-api";
import { AppShell } from "@/components/shell/AppShell";
import { SearchFilters } from "@/components/search/SearchFilters";
import { PlannerFilters } from "@/components/search/PlannerFilters";
import { ArtistCard } from "@/components/search/ArtistCard";
import { PlannerCard } from "@/components/search/PlannerCard";
import {
  readArtistSearchUrl,
  readPlannerSearchUrl,
  buildArtistSearchQuery,
  buildPlannerSearchQuery,
  resolveCategorySelection,
  selectionToUrlSlugs,
  apiCategorySlugs,
  validateEventTypes,
} from "@/lib/search-url";
import type { ArtistCard as ArtistCardType, CategoryGroup, SearchArtistsParams } from "@/types/artists";
import type { PlannerCard as PlannerCardType, SearchPlannersParams } from "@/types/planners";

type Filters = Pick<SearchArtistsParams, "city" | "minPrice" | "maxPrice" | "verifiedOnly" | "sort">;
type PlannerFiltersState = Pick<SearchPlannersParams, "city" | "country" | "sort">;

/*
 * The query string is the state, not a copy of it.
 *
 * The shareable filters — text query, category or event-type selection, and
 * page — are read from useSearchParams() on every render and written back
 * with router.replace. Holding them in useState as well would mean two
 * sources of truth to keep in step, which is the bug this page already had
 * in its simplest form: it kept the state and ignored the URL entirely.
 *
 * replace rather than push, so the back button leaves /search rather than
 * walking back through every filter change and every debounced keystroke.
 *
 * The finer filters (city, price, verified-only, sort) stay in local state
 * deliberately — they are refinements made after arriving, not something
 * anyone links to.
 */

function ArtistDirectory({ isPlanner }: { isPlanner: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  // The category filter cannot be read until the taxonomy has loaded: the URL
  // carries a flat slug list, and turning that into "which group, which
  // leaves" needs the group tree. Until then the request is held back rather
  // than fired unfiltered and then fired again — that would flash the whole
  // roster before narrowing to the one category the visitor asked for.
  const [categoriesSettled, setCategoriesSettled] = useState(false);

  const urlState = readArtistSearchUrl(searchParams);
  const query = urlState.q;
  const page = urlState.page;
  const selection = resolveCategorySelection(groups, urlState.categories);
  const selectedGroup = selection.group;
  const selectedSubs = selection.subs;

  // The text input is the one thing that cannot be driven by the URL: it has
  // to echo each keystroke immediately, while the URL only catches up once
  // typing pauses. Seeded from the URL on mount so a shared link shows its
  // own query in the box.
  const [rawQuery, setRawQuery] = useState(query);
  const [filters, setFilters] = useState<Filters>({});

  const [results, setResults] = useState<ArtistCardType[]>([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  function replaceUrl(next: { q: string; categories: string[]; page: number }) {
    const qs = buildArtistSearchQuery(next);
    if (qs === searchParams.toString()) return;
    router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
  }

  // Only planners can save artists — fetch which ones are already saved
  // once, so each card can show a filled/outline heart without a
  // per-card round trip.
  useEffect(() => {
    if (!isPlanner) return;
    let cancelled = false;
    listSavedArtistIds()
      .then((ids) => {
        if (!cancelled) setSavedIds(new Set(ids));
      })
      .catch(() => {
        // Non-critical — hearts just default to outline if this fails.
      });
    return () => {
      cancelled = true;
    };
  }, [isPlanner]);

  async function toggleSave(artistId: string) {
    const wasSaved = savedIds.has(artistId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(artistId);
      else next.add(artistId);
      return next;
    });
    try {
      if (wasSaved) await unsaveArtist(artistId);
      else await saveArtist(artistId);
    } catch {
      // Revert on failure.
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(artistId);
        else next.delete(artistId);
        return next;
      });
    }
  }

  // Debounce the free-text query so we're not writing a URL per keystroke.
  //
  // The equality check is what makes this safe on mount: rawQuery starts as
  // the URL's own query, so there is nothing to write and, crucially, no
  // reset of page — which would otherwise throw away the page number of any
  // link that carries one.
  useEffect(() => {
    if (rawQuery.trim() === query) return;
    const t = setTimeout(() => {
      replaceUrl({
        q: rawQuery,
        categories: selectionToUrlSlugs(selection),
        page: 1,
      });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQuery, query]);

  // Load the category rows once. Kept grouped — the filter shows main
  // categories first and only reveals a group's sub-categories once it's
  // picked, so flattening here would throw away the structure it needs.
  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((data) => {
        if (!cancelled) setGroups(data);
      })
      .catch(() => {
        // Non-critical for the chip row. It does mean a category in the URL
        // cannot be validated, so it is dropped and the search runs broader
        // rather than not running at all.
      })
      .finally(() => {
        if (!cancelled) setCategoriesSettled(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // What actually goes to the API: leaves only, so a group with nothing
  // ticked expands to all of its leaves. Stable primitive for the effect
  // dependency — the array identity changes every render, the joined string
  // doesn't.
  const categoryKey = apiCategorySlugs(groups, selection).join(",");

  // The actual search request.
  useEffect(() => {
    if (!categoriesSettled) return;
    let cancelled = false;
    let redirecting = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchArtists({
          q: query || undefined,
          categories: categoryKey ? categoryKey.split(",") : [],
          ...filters,
          page,
        });
        if (cancelled) return;
        // A link can name a page that no longer has results — a bookmarked
        // page 4 of a category that has since shrunk to one page. The pager
        // only renders when there is more than one page, so landing past the
        // end would strand the visitor on an empty screen with no way back.
        // Clamp to the last real page and let the refetch follow.
        if (res.meta.pages >= 1 && page > res.meta.pages) {
          redirecting = true;
          goToPage(res.meta.pages);
          return;
        }
        setResults(res.data);
        setMeta({ total: res.meta.total, pages: res.meta.pages });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Couldn't load results. Please try again.");
        }
      } finally {
        // Stay in the loading state through a clamp, so the empty result set
        // never flashes on the way to the corrected page.
        if (!cancelled && !redirecting) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryKey, filters, page, categoriesSettled]);

  // Switching main category drops the previous group's sub-selection —
  // those slugs belong to a group that's no longer on screen.
  function selectGroup(slug: string | null) {
    replaceUrl({ q: query, categories: slug ? [slug] : [], page: 1 });
  }

  function toggleSub(slug: string) {
    const nextSubs = selectedSubs.includes(slug)
      ? selectedSubs.filter((s) => s !== slug)
      : [...selectedSubs, slug];
    replaceUrl({
      q: query,
      // Unticking the last leaf falls back to the whole group rather than to
      // no filter at all — the group is still open on screen.
      categories: selectionToUrlSlugs({ group: selectedGroup, subs: nextSubs }),
      page: 1,
    });
  }

  // Unticks every leaf but keeps the group open, which is what the control
  // sits under and what it did before.
  function clearSubs() {
    replaceUrl({
      q: query,
      categories: selectionToUrlSlugs({ group: selectedGroup, subs: [] }),
      page: 1,
    });
  }

  function updateFilters(next: Filters) {
    setFilters(next);
    goToPage(1);
  }

  function goToPage(next: number) {
    replaceUrl({ q: query, categories: selectionToUrlSlugs(selection), page: next });
  }

  return (
    <div>
      <SearchFilters
        query={rawQuery}
        onQueryChange={setRawQuery}
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={selectGroup}
        selectedSubs={selectedSubs}
        onToggleSub={toggleSub}
        onClearSubs={clearSubs}
        filters={filters}
        onFiltersChange={updateFilters}
      />

      <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
        <span className="text-xs text-faint">
          {loading ? "Searching…" : `${meta.total} artist${meta.total === 1 ? "" : "s"} found`}
        </span>
      </div>

      {error && <p className="px-4 py-6 text-sm text-danger">{error}</p>}

      {!error && !loading && results.length === 0 && (
        <div className="flex flex-col items-center text-center px-8 py-16">
          <i className="ti ti-mood-empty text-2xl text-faint mb-2" />
          <p className="text-sm text-muted">No artists match those filters yet.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 px-4 pb-6">
        {results.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            isSaved={isPlanner ? savedIds.has(artist.id) : undefined}
            onToggleSave={isPlanner ? () => toggleSave(artist.id) : undefined}
          />
        ))}
      </div>

      {meta.pages > 1 && (
        <div className="flex items-center justify-center gap-4 pb-8 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-faint">
            Page {page} of {meta.pages}
          </span>
          <button
            disabled={page >= meta.pages}
            onClick={() => goToPage(page + 1)}
            className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function PlannerDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [eventTypes, setEventTypes] = useState<string[]>([]);
  // Same reasoning as the artist view: event types in the URL are validated
  // against the list the API offers, so the request waits for that list.
  const [eventTypesSettled, setEventTypesSettled] = useState(false);

  const urlState = readPlannerSearchUrl(searchParams);
  const query = urlState.q;
  const page = urlState.page;
  const selectedEventTypes = validateEventTypes(eventTypes, urlState.eventTypes);

  const [rawQuery, setRawQuery] = useState(query);
  const [filters, setFilters] = useState<PlannerFiltersState>({});

  const [results, setResults] = useState<PlannerCardType[]>([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function replaceUrl(next: { q: string; eventTypes: string[]; page: number }) {
    const qs = buildPlannerSearchQuery(next);
    if (qs === searchParams.toString()) return;
    router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
  }

  // Debounce the free-text query so we're not writing a URL per keystroke.
  useEffect(() => {
    if (rawQuery.trim() === query) return;
    const t = setTimeout(() => {
      replaceUrl({ q: rawQuery, eventTypes: selectedEventTypes, page: 1 });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQuery, query]);

  // Load the event-type chip row once.
  useEffect(() => {
    let cancelled = false;
    getEventTypes()
      .then((types) => {
        if (!cancelled) setEventTypes(types);
      })
      .catch(() => {
        // Non-critical — search still works without the chip row.
      })
      .finally(() => {
        if (!cancelled) setEventTypesSettled(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Stable primitive for the effect dependency, as above.
  const eventTypeKey = selectedEventTypes.join(",");

  // The actual search request.
  useEffect(() => {
    if (!eventTypesSettled) return;
    let cancelled = false;
    let redirecting = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchPlanners({
          q: query || undefined,
          eventTypes: eventTypeKey ? eventTypeKey.split(",") : [],
          ...filters,
          page,
        });
        if (cancelled) return;
        // Clamp a page past the end, as in the artist view above.
        if (res.meta.pages >= 1 && page > res.meta.pages) {
          redirecting = true;
          goToPage(res.meta.pages);
          return;
        }
        setResults(res.data);
        setMeta({ total: res.meta.total, pages: res.meta.pages });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Couldn't load results. Please try again.");
        }
      } finally {
        if (!cancelled && !redirecting) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, eventTypeKey, filters, page, eventTypesSettled]);

  function toggleEventType(type: string) {
    const next = selectedEventTypes.includes(type)
      ? selectedEventTypes.filter((t) => t !== type)
      : [...selectedEventTypes, type];
    replaceUrl({ q: query, eventTypes: next, page: 1 });
  }

  function clearEventTypes() {
    replaceUrl({ q: query, eventTypes: [], page: 1 });
  }

  function updateFilters(next: PlannerFiltersState) {
    setFilters(next);
    goToPage(1);
  }

  function goToPage(next: number) {
    replaceUrl({ q: query, eventTypes: selectedEventTypes, page: next });
  }

  return (
    <div>
      <PlannerFilters
        query={rawQuery}
        onQueryChange={setRawQuery}
        eventTypes={eventTypes}
        selectedEventTypes={selectedEventTypes}
        onToggleEventType={toggleEventType}
        onClearEventTypes={clearEventTypes}
        filters={filters}
        onFiltersChange={updateFilters}
      />

      <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
        <span className="text-xs text-faint">
          {loading ? "Searching…" : `${meta.total} planner${meta.total === 1 ? "" : "s"} found`}
        </span>
      </div>

      {error && <p className="px-4 py-6 text-sm text-danger">{error}</p>}

      {!error && !loading && results.length === 0 && (
        <div className="flex flex-col items-center text-center px-8 py-16">
          <i className="ti ti-mood-empty text-2xl text-faint mb-2" />
          <p className="text-sm text-muted">No planners match those filters yet.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 px-4 pb-6">
        {results.map((planner) => (
          <PlannerCard key={planner.id} planner={planner} />
        ))}
      </div>

      {meta.pages > 1 && (
        <div className="flex items-center justify-center gap-4 pb-8 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-faint">
            Page {page} of {meta.pages}
          </span>
          <button
            disabled={page >= meta.pages}
            onClick={() => goToPage(page + 1)}
            className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function SearchPageInner() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  // Search is open to guests as of the guest-experience work. This
  // deliberately reverses the members-only rule that use-require-auth.ts
  // still documents for the rest of the app: the whole point of masking
  // names and banding prices server-side is that the roster can be browsed
  // without an account, with only the contact details held back.
  //
  // isPlanner is false, so the save hearts are not rendered — there is no
  // account to save anything to.
  if (!user) {
    return (
      <GuestChrome showSearchLink={false}>
        <ArtistDirectory isPlanner={false} />
      </GuestChrome>
    );
  }

  // Artists use this to find bookers — now real, via GET /planners.
  //
  // No `background` override on either branch: the backdrop follows the
  // logged-in role (AppShell's default), same as every other page. It used
  // to follow the directory being browsed instead, which meant an artist
  // searching bookers saw the booker artwork and vice versa — the inverse
  // of what the rest of the app does.
  if (user?.role === "artist") {
    return (
      <AppShell user={user}>
        <PlannerDirectory />
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <ArtistDirectory isPlanner={user.role === "planner"} />
    </AppShell>
  );
}

export function SearchClient() {
  // useSearchParams needs a Suspense boundary in the App Router, or the
  // route opts the whole tree out of static rendering at build time. Same
  // pattern as the admin panel.
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
