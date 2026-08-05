"use client";

import { buildMonthGrid, isBlocked, todayKey } from "@/lib/calendar";
import type { AvailabilityBlock } from "@/types/artists";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CalendarGrid({
  year,
  month,
  blocks,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  interactive = true,
  canGoPrev = true,
}: {
  year: number;
  month: number;
  blocks: AvailabilityBlock[];
  onSelectDay: (dateKey: string, blocked: boolean) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  // false renders the grid as a read-only display: days aren't buttons,
  // and nothing shows a hover or pointer affordance. Used on the public
  // profile, where the calendar reports availability rather than editing
  // it.
  interactive?: boolean;
  // Lets the caller pin the view at the current month — there's nothing
  // to see in the past, and blocks aren't fetched for it.
  canGoPrev?: boolean;
}) {
  const cells = buildMonthGrid(year, month);
  const today = todayKey();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-4 pb-3.5">
        <button
          onClick={onPrevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center text-muted disabled:opacity-30"
          aria-label="Previous month"
        >
          <i className="ti ti-chevron-left text-base" />
        </button>
        <span className="text-base font-bold text-ink">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={onNextMonth}
          className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center text-muted"
          aria-label="Next month"
        >
          <i className="ti ti-chevron-right text-base" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 px-4 mb-1">
        {DOW.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-faint py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 px-4 pb-4 border-b border-hairline">
        {cells.map((cell, i) => {
          if (cell.key === null) return <div key={`pad-${i}`} />;

          const cellDate = new Date(year, month, cell.day!);
          const isPast = cellDate < startOfToday;
          const isToday = cell.key === today;
          const blocked = isBlocked(cell.key, blocks);

          // cursor-pointer is applied per-case rather than relying on the
          // global button rule, so a read-only grid never implies a click
          // target.
          const clickable = interactive && !isPast ? " cursor-pointer" : "";
          let classes = "aspect-square rounded-full flex items-center justify-center text-[13px] ";
          if (isPast) {
            classes += "text-[#e9d9c1]";
          } else if (blocked) {
            classes += "bg-danger-bg text-danger" + clickable;
          } else if (isToday) {
            classes += "border-[1.5px] border-clay text-clay font-bold" + clickable;
          } else {
            classes += "text-ink" + clickable;
            if (interactive) classes += " hover:bg-sand";
          }

          // Read-only: plain divs, so there's no focusable control and no
          // pointer cursor implying the day does something.
          if (!interactive) {
            return (
              <div key={cell.key} className={classes}>
                {cell.day}
              </div>
            );
          }

          return (
            <button
              key={cell.key}
              disabled={isPast}
              onClick={() => onSelectDay(cell.key!, blocked)}
              className={classes}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3.5 px-4 py-3 border-b border-hairline">
        <Legend swatch="border-[1.5px] border-clay" label="Today" />
        <Legend swatch="bg-surface border border-hairline" label="Available" />
        <Legend swatch="bg-danger-bg border border-[#FCA5A5]" label="Unavailable" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted">
      <span className={`w-2.5 h-2.5 rounded-full ${swatch}`} />
      {label}
    </div>
  );
}
