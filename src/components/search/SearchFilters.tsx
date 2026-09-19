"use client";

import { categoryIcon } from "@/lib/category-icons";
import type { CategoryGroup, SearchArtistsParams } from "@/types/artists";

export type ArtistFilters = Pick<
  SearchArtistsParams,
  "city" | "minPrice" | "maxPrice" | "sort"
>;

/**
 * How many of the finer filters are set.
 *
 * Sort is excluded on purpose: it is not a filter, it removes nothing, and
 * counting it would put a badge on the Filters button for a control that no
 * longer lives behind it. See item 15 — sort sits on the result row now.
 */
export function countActiveFilters(filters: ArtistFilters): number {
  return (
    (filters.city ? 1 : 0) +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0)
  );
}

interface TopBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  groups: CategoryGroup[];
  // At most one main category at a time — null means "All".
  selectedGroup: string | null;
  onSelectGroup: (slug: string | null) => void;
  // Sub-categories within the selected group. Multi-select; empty means
  // "everything in this group".
  selectedSubs: string[];
  onToggleSub: (slug: string) => void;
  // Unticking every sub-category at once. A distinct callback rather than
  // toggling each one in a loop: the selection lives in the URL, so every
  // toggle reads the same value and only the last write would survive.
  onClearSubs: () => void;
  /** Opens the mobile sheet. The rail is always open at >=1024px, so this
   *  button is hidden there rather than toggling anything. */
  onOpenFilters: () => void;
  activeFilterCount: number;
}

/**
 * The full-width bar above the results: text query and the category rows.
 *
 * The finer filters are NOT here any more — they are in the rail or the
 * sheet (see FilterShell), because expanding them inline pushed the grid
 * down and hid the results at the moment you were narrowing them.
 */
export function SearchTopBar({
  query,
  onQueryChange,
  groups,
  selectedGroup,
  onSelectGroup,
  selectedSubs,
  onToggleSub,
  onClearSubs,
  onOpenFilters,
  activeFilterCount,
}: TopBarProps) {
  const activeGroup = groups.find((g) => g.slug === selectedGroup) ?? null;

  return (
    <div className="border-b border-hairline bg-surface">
      <div className="flex items-center gap-2 px-4 pt-3">
        {/* The ring goes on the WRAPPER, not the input: the input is
            bg-transparent inside this box, so a ring on it would draw around
            the text and leave the search icon outside the focused thing. The
            input itself carries outline-none and had nothing restoring it —
            keyboard focus on the one control this page is built around was
            invisible. has-[:focus-visible] rather than focus-within so the
            ring answers the keyboard and not every click; clay is 6.73 on the
            sand fill and 6.00 on the mint page ground, so it reads on both. */}
        <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-hairline bg-sand px-3 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-clay">
          <i className="ti ti-search text-base text-faint" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by name or keyword…"
            aria-label="Search artists"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
          />
        </div>
        <button
          onClick={onOpenFilters}
          className="relative flex items-center gap-1.5 rounded-[10px] border border-hairline px-3 py-2 text-xs font-medium text-muted lg:hidden"
        >
          <i className="ti ti-adjustments-horizontal text-sm" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-clay-deep text-[9px] text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Main categories only. Picking one reveals its sub-categories
          below — listing all 38 leaf categories at once (what this used to
          do) made the row unreadable and hid most of them off-screen.
          Single-select: browsing "Music" and "Visual" at the same time
          isn't a meaningful search. */}
      {groups.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-3">
          <button
            onClick={() => onSelectGroup(null)}
            aria-pressed={selectedGroup === null}
            className={`rounded-2xl border px-3 py-2 text-xs ${
              selectedGroup === null
                ? "border-[#e0a570] bg-sand font-semibold text-clay"
                : "border-hairline text-muted"
            }`}
          >
            All categories
          </button>
          {groups.map((g) => {
            const selected = g.slug === selectedGroup;
            return (
              <button
                key={g.id}
                onClick={() => onSelectGroup(selected ? null : g.slug)}
                aria-pressed={selected}
                className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs ${
                  selected
                    ? "border-[#e0a570] bg-sand font-semibold text-clay"
                    : "border-hairline text-muted"
                }`}
              >
                {categoryIcon(g.icon) && <i className={`ti ${categoryIcon(g.icon)} text-sm`} />}
                {g.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Sub-categories for the chosen main category. Selecting none means
          "everything in this group", so the results aren't empty the moment
          a main category is picked. */}
      {activeGroup && activeGroup.categories.length > 0 && (
        <div className="-mt-1 px-4 pb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-faint">
              {activeGroup.name}
            </span>
            {selectedSubs.length > 0 && (
              <button onClick={onClearSubs} className="px-1 py-1.5 text-xs font-semibold text-clay">
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeGroup.categories.map((c) => {
              const selected = selectedSubs.includes(c.slug);
              return (
                <button
                  key={c.id}
                  onClick={() => onToggleSub(c.slug)}
                  aria-pressed={selected}
                  className={`rounded-2xl border px-2.5 py-2 text-xs ${
                    selected
                      ? "border-clay bg-clay-deep font-semibold text-white"
                      : "border-hairline bg-surface text-muted"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The finer filters themselves, with no chrome of their own.
 *
 * Rendered by FilterRail at >=1024px and by FilterSheet below it, so both
 * sizes get the same controls from one definition. Sort is not here — it is
 * a different intent from filtering and sits on the result row instead.
 */
export function ArtistFilterFields({
  filters,
  onFiltersChange,
}: {
  filters: ArtistFilters;
  onFiltersChange: (next: ArtistFilters) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-xs">
        <span className="mb-1 block font-semibold text-ink">City</span>
        <input
          value={filters.city ?? ""}
          onChange={(e) => onFiltersChange({ ...filters, city: e.target.value || undefined })}
          placeholder="e.g. Beirut"
          className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-clay"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs">
          <span className="mb-1 block font-semibold text-ink">Min price (USD)</span>
          <input
            type="number"
            min={0}
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-clay"
          />
        </label>
        <label className="block text-xs">
          <span className="mb-1 block font-semibold text-ink">Max price (USD)</span>
          <input
            type="number"
            min={0}
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-clay"
          />
        </label>
      </div>

    </div>
  );
}
