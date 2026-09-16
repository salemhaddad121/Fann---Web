"use client";

import type { SearchPlannersParams } from "@/types/planners";

export type PlannerFilters = Pick<SearchPlannersParams, "city" | "country" | "sort">;

/** Sort is excluded — see the note on countActiveFilters in SearchFilters. */
export function countActivePlannerFilters(filters: PlannerFilters): number {
  return (filters.city ? 1 : 0) + (filters.country ? 1 : 0);
}

interface TopBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  eventTypes: string[];
  selectedEventTypes: string[];
  onToggleEventType: (type: string) => void;
  // Clearing the whole selection at once. A distinct callback rather than
  // toggling each one in a loop: the selection lives in the URL, so every
  // toggle reads the same value and only the last write would survive.
  onClearEventTypes: () => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

/** The planner directory's mirror of SearchTopBar. */
export function PlannerTopBar({
  query,
  onQueryChange,
  eventTypes,
  selectedEventTypes,
  onToggleEventType,
  onClearEventTypes,
  onOpenFilters,
  activeFilterCount,
}: TopBarProps) {
  return (
    <div className="border-b border-hairline bg-surface">
      <div className="flex items-center gap-2 px-4 pt-3">
        <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-hairline bg-sand px-3 py-2">
          <i className="ti ti-search text-base text-faint" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by name or keyword…"
            aria-label="Search planners"
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
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal text-[9px] text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {eventTypes.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
          <button
            onClick={onClearEventTypes}
            className={`shrink-0 rounded-2xl border px-3 py-2 text-xs ${
              selectedEventTypes.length === 0
                ? "border-[#7fb3b0] bg-[#dfeceb] font-semibold text-teal"
                : "border-hairline text-muted"
            }`}
          >
            All event types
          </button>
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => onToggleEventType(type)}
              className={`shrink-0 rounded-2xl border px-3 py-2 text-xs ${
                selectedEventTypes.includes(type)
                  ? "border-[#7fb3b0] bg-[#dfeceb] font-semibold text-teal"
                  : "border-hairline text-muted"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Rendered by FilterRail at >=1024px and FilterSheet below it. */
export function PlannerFilterFields({
  filters,
  onFiltersChange,
}: {
  filters: PlannerFilters;
  onFiltersChange: (next: PlannerFilters) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-xs">
        <span className="mb-1 block font-semibold text-ink">City</span>
        <input
          value={filters.city ?? ""}
          onChange={(e) => onFiltersChange({ ...filters, city: e.target.value || undefined })}
          placeholder="e.g. Beirut"
          className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-teal"
        />
      </label>
      <label className="block text-xs">
        <span className="mb-1 block font-semibold text-ink">Country</span>
        <input
          value={filters.country ?? ""}
          onChange={(e) => onFiltersChange({ ...filters, country: e.target.value || undefined })}
          placeholder="e.g. Lebanon"
          className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-teal"
        />
      </label>
    </div>
  );
}
