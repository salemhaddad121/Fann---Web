"use client";

import { useState } from "react";
import type { CategoryGroup, SearchArtistsParams } from "@/types/artists";

interface Props {
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
  filters: Pick<SearchArtistsParams, "city" | "minPrice" | "maxPrice" | "verifiedOnly" | "sort">;
  onFiltersChange: (next: Props["filters"]) => void;
}

export function SearchFilters({
  query,
  onQueryChange,
  groups,
  selectedGroup,
  onSelectGroup,
  selectedSubs,
  onToggleSub,
  filters,
  onFiltersChange,
}: Props) {
  const activeGroup = groups.find((g) => g.slug === selectedGroup) ?? null;
  const [panelOpen, setPanelOpen] = useState(false);
  const activeFilterCount =
    (filters.city ? 1 : 0) +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0);

  return (
    <div className="bg-white border-b border-hairline">
      <div className="flex items-center gap-2 px-4 pt-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-[10px] border border-hairline bg-mist">
          <i className="ti ti-search text-faint text-base" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by name or keyword…"
            className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-faint"
          />
        </div>
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-hairline text-xs font-medium text-muted"
        >
          <i className="ti ti-adjustments-horizontal text-sm" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo text-white text-[9px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Main categories only. Picking one reveals its sub-categories
          below — listing all 36 leaf categories at once (what this used to
          do) made the row unreadable and hid most of them off-screen.
          Single-select: browsing "Music" and "Visual" at the same time
          isn't a meaningful search. */}
      {groups.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-3">
          <button
            onClick={() => onSelectGroup(null)}
            aria-pressed={selectedGroup === null}
            className={`px-3 py-1 rounded-2xl text-xs border ${
              selectedGroup === null
                ? "bg-mist text-indigo border-[#93ADE8] font-semibold"
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
                className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs border ${
                  selected
                    ? "bg-mist text-indigo border-[#93ADE8] font-semibold"
                    : "border-hairline text-muted"
                }`}
              >
                {g.icon && <i className={`ti ${g.icon} text-sm`} />}
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
        <div className="px-4 pb-3 -mt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">
              {activeGroup.name}
            </span>
            {selectedSubs.length > 0 && (
              <button
                onClick={() => selectedSubs.forEach(onToggleSub)}
                className="text-[11px] font-semibold text-indigo"
              >
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
                  className={`px-2.5 py-1 rounded-2xl text-[11px] border ${
                    selected
                      ? "bg-indigo text-white border-indigo font-semibold"
                      : "border-hairline text-muted bg-white"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {panelOpen && (
        <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-3 border-t border-hairline">
          <label className="col-span-2 text-xs">
            <span className="block font-semibold text-ink mb-1">City</span>
            <input
              value={filters.city ?? ""}
              onChange={(e) => onFiltersChange({ ...filters, city: e.target.value || undefined })}
              placeholder="e.g. Beirut"
              className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-indigo"
            />
          </label>

          <label className="text-xs">
            <span className="block font-semibold text-ink mb-1">Min price (USD)</span>
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
              className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-indigo"
            />
          </label>
          <label className="text-xs">
            <span className="block font-semibold text-ink mb-1">Max price (USD)</span>
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
              className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-indigo"
            />
          </label>

          <label className="text-xs">
            <span className="block font-semibold text-ink mb-1">Sort by</span>
            <select
              value={filters.sort ?? "newest"}
              onChange={(e) =>
                onFiltersChange({ ...filters, sort: e.target.value as SearchArtistsParams["sort"] })
              }
              className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-indigo bg-white"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs mt-5">
            <input
              type="checkbox"
              checked={!!filters.verifiedOnly}
              onChange={(e) => onFiltersChange({ ...filters, verifiedOnly: e.target.checked })}
              className="w-4 h-4 accent-indigo"
            />
            <span className="font-semibold text-ink">Verified only</span>
          </label>
        </div>
      )}
    </div>
  );
}
