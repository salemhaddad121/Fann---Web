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
}: {
  year: number;
  month: number;
  blocks: AvailabilityBlock[];
  onSelectDay: (dateKey: string, blocked: boolean) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
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
          className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center text-muted"
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

          let classes = "aspect-square rounded-full flex items-center justify-center text-[13px] ";
          if (isPast) {
            classes += "text-[#C5D3EE]";
          } else if (blocked) {
            classes += "bg-danger-bg text-danger cursor-pointer";
          } else if (isToday) {
            classes += "border-[1.5px] border-indigo text-indigo font-bold cursor-pointer";
          } else {
            classes += "text-ink cursor-pointer hover:bg-mist";
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
        <Legend swatch="border-[1.5px] border-indigo" label="Today" />
        <Legend swatch="bg-white border border-hairline" label="Available" />
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
