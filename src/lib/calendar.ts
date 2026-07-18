import type { AvailabilityBlock } from "@/types/artists";

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export interface CalendarCell {
  key: string | null; // null = padding cell before the 1st of the month
  day: number | null;
}

export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ key: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: toDateKey(new Date(year, month, d)), day: d });
  }
  return cells;
}

export function isBlocked(dateKey: string, blocks: AvailabilityBlock[]): boolean {
  return blocks.some((b) => b.start_date <= dateKey && dateKey <= b.end_date);
}

export function formatDateLong(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatBlockRange(startKey: string, endKey: string): string {
  if (startKey === endKey) return formatDateLong(startKey);
  return `${formatDateLong(startKey)} – ${formatDateLong(endKey)}`;
}
