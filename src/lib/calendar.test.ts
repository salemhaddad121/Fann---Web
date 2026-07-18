import { describe, it, expect } from "vitest";
import { toDateKey, buildMonthGrid, isBlocked, formatDateLong, formatBlockRange } from "./calendar";
import type { AvailabilityBlock } from "@/types/artists";

describe("toDateKey", () => {
  it("formats a date as YYYY-MM-DD with zero-padding", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05"); // January = month 0
    expect(toDateKey(new Date(2026, 11, 25))).toBe("2026-12-25");
  });
});

describe("buildMonthGrid", () => {
  it("produces exactly one cell per day in the month, with no padding for a month starting on Sunday", () => {
    // February 2026 starts on a Sunday.
    const cells = buildMonthGrid(2026, 1);
    const paddingCells = cells.filter((c) => c.key === null);
    const dayCells = cells.filter((c) => c.key !== null);
    expect(paddingCells).toHaveLength(0);
    expect(dayCells).toHaveLength(28); // 2026 is not a leap year
  });

  it("pads the front of the grid to align the 1st with its real weekday", () => {
    // July 2026 starts on a Wednesday (weekday index 3).
    const cells = buildMonthGrid(2026, 6);
    const paddingCells = cells.filter((c) => c.key === null);
    expect(paddingCells).toHaveLength(3);
    expect(cells[3]).toEqual({ key: "2026-07-01", day: 1 });
  });

  it("handles a 31-day month correctly", () => {
    const cells = buildMonthGrid(2026, 6); // July
    const dayCells = cells.filter((c) => c.key !== null);
    expect(dayCells).toHaveLength(31);
    expect(dayCells[dayCells.length - 1].key).toBe("2026-07-31");
  });
});

describe("isBlocked", () => {
  const blocks: AvailabilityBlock[] = [
    { id: "1", start_date: "2026-07-10", end_date: "2026-07-15", note: null },
  ];

  it("returns true for a date inside the block, inclusive of both ends", () => {
    expect(isBlocked("2026-07-10", blocks)).toBe(true);
    expect(isBlocked("2026-07-12", blocks)).toBe(true);
    expect(isBlocked("2026-07-15", blocks)).toBe(true);
  });

  it("returns false for a date outside the block", () => {
    expect(isBlocked("2026-07-09", blocks)).toBe(false);
    expect(isBlocked("2026-07-16", blocks)).toBe(false);
  });

  it("returns false when there are no blocks at all", () => {
    expect(isBlocked("2026-07-12", [])).toBe(false);
  });
});

describe("formatBlockRange", () => {
  it("shows a single date when start and end are the same day", () => {
    const formatted = formatBlockRange("2026-07-10", "2026-07-10");
    expect(formatted).toBe(formatDateLong("2026-07-10"));
    expect(formatted).not.toContain("–");
  });

  it("shows a range with an en-dash when start and end differ", () => {
    const formatted = formatBlockRange("2026-07-10", "2026-07-15");
    expect(formatted).toContain("–");
    expect(formatted).toContain(formatDateLong("2026-07-10"));
    expect(formatted).toContain(formatDateLong("2026-07-15"));
  });
});
