"use client";

import { useState } from "react";
import type { SearchPlannersParams } from "@/types/planners";

// Unlike artist categories, event types aren't backed by a reference table —
// planner_profiles.event_types is just a free-text JSONB array each planner
// fills in themselves. This is a curated common-values list for the chip
// row, not something fetched from the backend.
const COMMON_EVENT_TYPES = ["Wedding", "Corporate", "Festival", "Birthday", "Concert", "Private Party"];

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  selectedEventTypes: string[];
  onToggleEventType: (type: string) => void;
  filters: Pick<SearchPlannersParams, "city" | "country" | "sort">;
  onFiltersChange: (next: Props["filters"]) => void;
}

export function PlannerFilters({
  query,
  onQueryChange,
  selectedEventTypes,
  onToggleEventType,
  filters,
  onFiltersChange,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const activeFilterCount = (filters.city ? 1 : 0) + (filters.country ? 1 : 0);

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
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-sky text-white text-[9px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
        <button
          onClick={() => selectedEventTypes.forEach(onToggleEventType)}
          className={`shrink-0 px-3 py-1 rounded-2xl text-xs border ${
            selectedEventTypes.length === 0
              ? "bg-[#E0F2FE] text-sky border-[#38BDF8] font-semibold"
              : "border-hairline text-muted"
          }`}
        >
          All event types
        </button>
        {COMMON_EVENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onToggleEventType(type)}
            className={`shrink-0 px-3 py-1 rounded-2xl text-xs border ${
              selectedEventTypes.includes(type)
                ? "bg-[#E0F2FE] text-sky border-[#38BDF8] font-semibold"
                : "border-hairline text-muted"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {panelOpen && (
        <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-3 border-t border-hairline">
          <label className="text-xs">
            <span className="block font-semibold text-ink mb-1">City</span>
            <input
              value={filters.city ?? ""}
              onChange={(e) => onFiltersChange({ ...filters, city: e.target.value || undefined })}
              placeholder="e.g. Beirut"
              className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-sky"
            />
          </label>
          <label className="text-xs">
            <span className="block font-semibold text-ink mb-1">Country</span>
            <input
              value={filters.country ?? ""}
              onChange={(e) => onFiltersChange({ ...filters, country: e.target.value || undefined })}
              placeholder="e.g. Lebanon"
              className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-sky"
            />
          </label>
          <label className="col-span-2 text-xs">
            <span className="block font-semibold text-ink mb-1">Sort by</span>
            <select
              value={filters.sort ?? "newest"}
              onChange={(e) =>
                onFiltersChange({ ...filters, sort: e.target.value as SearchPlannersParams["sort"] })
              }
              className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-sky bg-white"
            >
              <option value="newest">Newest</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
