"use client";

import { useState } from "react";
import type { Category, SearchArtistsParams } from "@/types/artists";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  categories: Category[];
  selectedSlugs: string[];
  onToggleCategory: (slug: string) => void;
  filters: Pick<SearchArtistsParams, "city" | "minPrice" | "maxPrice" | "verifiedOnly" | "sort">;
  onFiltersChange: (next: Props["filters"]) => void;
}

export function SearchFilters({
  query,
  onQueryChange,
  categories,
  selectedSlugs,
  onToggleCategory,
  filters,
  onFiltersChange,
}: Props) {
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

      {categories.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
          <button
            onClick={() => selectedSlugs.forEach(onToggleCategory)}
            className={`shrink-0 px-3 py-1 rounded-2xl text-xs border ${
              selectedSlugs.length === 0
                ? "bg-mist text-indigo border-[#93ADE8] font-semibold"
                : "border-hairline text-muted"
            }`}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onToggleCategory(c.slug)}
              className={`shrink-0 px-3 py-1 rounded-2xl text-xs border ${
                selectedSlugs.includes(c.slug)
                  ? "bg-mist text-indigo border-[#93ADE8] font-semibold"
                  : "border-hairline text-muted"
              }`}
            >
              {c.name}
            </button>
          ))}
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
