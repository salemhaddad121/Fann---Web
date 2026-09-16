"use client";

/**
 * The row between the filters and the grid: what is active, how many
 * matched, and how it is ordered.
 *
 * Three separate complaints answered in one place, because they are the
 * same complaint — the page told you almost nothing about its own state.
 *
 *  - The only trace of an active filter was a count badge on the Filters
 *    button, and there was no clear-all control anywhere (only the
 *    sub-category "Clear"). Now every active filter is a removable chip.
 *  - The result count, the most orienting text on the page, was 12px
 *    --faint: the least legible style available. Now 14px --muted with the
 *    number in bold.
 *  - Sort lived inside the filter panel. Sorting and filtering are
 *    different intents, so it sits out here on its own.
 */

export interface ActiveChip {
  /** Stable identity for the remove callback and the React key. */
  key: string;
  label: string;
  onRemove: () => void;
}

export interface SortOption {
  value: string;
  label: string;
}

export function ResultBar({
  loading,
  total,
  noun,
  chips,
  onClearAll,
  sort,
  sortOptions,
  onSortChange,
  accent,
}: {
  loading: boolean;
  total: number;
  /** "artist" / "planner" — pluralised here. */
  noun: string;
  chips: ActiveChip[];
  onClearAll: () => void;
  sort: string;
  sortOptions: SortOption[];
  onSortChange: (next: string) => void;
  accent: "clay" | "teal";
}) {
  const focusClass = accent === "teal" ? "focus:border-teal" : "focus:border-clay";

  return (
    <div className="px-4 pt-3">
      {chips.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="flex items-center gap-1.5 rounded-2xl border border-hairline bg-sand px-3 py-1.5 text-xs font-medium text-ink"
            >
              {chip.label}
              <i className="ti ti-x text-xs text-muted" aria-hidden />
              <span className="sr-only">Remove filter</span>
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="px-2 py-1.5 text-xs font-semibold text-clay-deep underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5">
        <span className="text-sm text-muted">
          {loading ? (
            "Searching…"
          ) : (
            <>
              <strong className="font-bold text-ink">
                {total} {noun}
                {total === 1 ? "" : "s"}
              </strong>
              {chips.length > 0 ? " match your filters" : ""}
            </>
          )}
        </span>

        <label className="flex items-center gap-2 text-xs text-muted">
          <span className="sr-only sm:not-sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort by"
            className={`h-10 rounded-[10px] border border-hairline bg-surface px-2.5 text-sm text-ink outline-none ${focusClass}`}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
