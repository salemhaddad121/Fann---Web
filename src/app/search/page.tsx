"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { searchArtists, getCategories } from "@/lib/artists-api";
import { searchPlanners, getEventTypes } from "@/lib/planners-api";
import { listSavedArtistIds, saveArtist, unsaveArtist } from "@/lib/saved-api";
import { AppShell } from "@/components/shell/AppShell";
import { PageBackground } from "@/components/shell/PageBackground";
import { PublicHeader } from "@/components/search/PublicHeader";
import { SearchFilters } from "@/components/search/SearchFilters";
import { PlannerFilters } from "@/components/search/PlannerFilters";
import { ArtistCard } from "@/components/search/ArtistCard";
import { PlannerCard } from "@/components/search/PlannerCard";
import type { ArtistCard as ArtistCardType, Category, SearchArtistsParams } from "@/types/artists";
import type { PlannerCard as PlannerCardType, SearchPlannersParams } from "@/types/planners";

type Filters = Pick<SearchArtistsParams, "city" | "minPrice" | "maxPrice" | "verifiedOnly" | "sort">;
type PlannerFiltersState = Pick<SearchPlannersParams, "city" | "country" | "sort">;

function ArtistDirectory({ isPlanner }: { isPlanner: boolean }) {
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<ArtistCardType[]>([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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

  // Debounce the free-text query so we're not firing a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(rawQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [rawQuery]);

  // Load the category chip row once.
  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((groups) => {
        if (cancelled) return;
        const flat = groups.flatMap((g) => g.categories);
        setCategories(flat);
      })
      .catch(() => {
        // Non-critical — search still works without the chip row.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The actual search request.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchArtists({ q: query || undefined, categories: selectedSlugs, ...filters, page });
        if (cancelled) return;
        setResults(res.data);
        setMeta({ total: res.meta.total, pages: res.meta.pages });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Couldn't load results. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, selectedSlugs, filters, page]);

  function toggleCategory(slug: string) {
    setSelectedSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    setPage(1);
  }

  function updateFilters(next: Filters) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div>
      <SearchFilters
        query={rawQuery}
        onQueryChange={setRawQuery}
        categories={categories}
        selectedSlugs={selectedSlugs}
        onToggleCategory={toggleCategory}
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
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-faint">
            Page {page} of {meta.pages}
          </span>
          <button
            disabled={page >= meta.pages}
            onClick={() => setPage((p) => p + 1)}
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
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState<PlannerFiltersState>({});
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<PlannerCardType[]>([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the free-text query so we're not firing a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(rawQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [rawQuery]);

  // Load the event-type chip row once.
  useEffect(() => {
    let cancelled = false;
    getEventTypes()
      .then((types) => {
        if (!cancelled) setEventTypes(types);
      })
      .catch(() => {
        // Non-critical — search still works without the chip row.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The actual search request.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchPlanners({
          q: query || undefined,
          eventTypes: selectedEventTypes,
          ...filters,
          page,
        });
        if (cancelled) return;
        setResults(res.data);
        setMeta({ total: res.meta.total, pages: res.meta.pages });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Couldn't load results. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, selectedEventTypes, filters, page]);

  function toggleEventType(type: string) {
    setSelectedEventTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
    setPage(1);
  }

  function updateFilters(next: PlannerFiltersState) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div>
      <PlannerFilters
        query={rawQuery}
        onQueryChange={setRawQuery}
        eventTypes={eventTypes}
        selectedEventTypes={selectedEventTypes}
        onToggleEventType={toggleEventType}
        filters={filters}
        onFiltersChange={updateFilters}
      />

      <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
        <span className="text-xs text-faint">
          {loading ? "Searching…" : `${meta.total} booker${meta.total === 1 ? "" : "s"} found`}
        </span>
      </div>

      {error && <p className="px-4 py-6 text-sm text-danger">{error}</p>}

      {!error && !loading && results.length === 0 && (
        <div className="flex flex-col items-center text-center px-8 py-16">
          <i className="ti ti-mood-empty text-2xl text-faint mb-2" />
          <p className="text-sm text-muted">No bookers match those filters yet.</p>
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
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-faint">
            Page {page} of {meta.pages}
          </span>
          <button
            disabled={page >= meta.pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

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

  if (user) {
    return (
      <AppShell user={user}>
        <ArtistDirectory isPlanner={user.role === "planner"} />
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen relative">
      <PageBackground role="artist" />
      <div className="relative z-10">
        <PublicHeader />
        <ArtistDirectory isPlanner={false} />
      </div>
    </div>
  );
}
