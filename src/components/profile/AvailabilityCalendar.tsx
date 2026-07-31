"use client";

import { useState } from "react";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { isBlocked } from "@/lib/calendar";
import type { AvailabilityBlock } from "@/types/artists";

// The public-profile view of an artist's availability: the same grid the
// artist uses to block dates, with their blocked days highlighted.
//
// Read-only unless the caller passes onPickDate. Kept as a prop rather
// than a separate component so the booking flow can light the same grid
// up without a second calendar implementation.
export function AvailabilityCalendar({
  blocks,
  onPickDate,
}: {
  blocks: AvailabilityBlock[];
  onPickDate?: (dateKey: string) => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // The profile payload only carries blocks ending today or later, so
  // browsing backwards would show a misleadingly empty month. Pin the
  // view at the current month instead.
  const atCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  function changeMonth(dir: 1 | -1) {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m);
    setYear(y);
  }

  return (
    <CalendarGrid
      year={year}
      month={month}
      blocks={blocks}
      interactive={!!onPickDate}
      canGoPrev={!atCurrentMonth}
      onSelectDay={(dateKey) => {
        // A blocked day isn't offerable — the backend rejects a booking
        // on one, so don't let the flow start.
        if (!onPickDate || isBlocked(dateKey, blocks)) return;
        onPickDate(dateKey);
      }}
      onPrevMonth={() => changeMonth(-1)}
      onNextMonth={() => changeMonth(1)}
    />
  );
}
