import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime, formatDateDivider, initialsFromName } from "./format";

const NOW = new Date("2026-07-18T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatRelativeTime", () => {
  it('shows "Just now" for anything under a minute ago', () => {
    const iso = new Date(NOW.getTime() - 30_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("Just now");
  });

  it("shows minutes ago for under an hour", () => {
    const iso = new Date(NOW.getTime() - 5 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("5m ago");
  });

  it("shows hours ago for under a day", () => {
    const iso = new Date(NOW.getTime() - 3 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("3h ago");
  });

  it('shows "Yesterday" for exactly one calendar day back', () => {
    const iso = new Date(NOW.getTime() - 25 * 60 * 60_000).toISOString(); // safely into "yesterday"
    expect(formatRelativeTime(iso)).toBe("Yesterday");
  });
});

describe("formatDateDivider", () => {
  it('shows "Today" for the current date', () => {
    expect(formatDateDivider(NOW.toISOString())).toBe("Today");
  });

  it('shows "Yesterday" for one calendar day back', () => {
    const iso = new Date(NOW.getTime() - 24 * 60 * 60_000).toISOString();
    expect(formatDateDivider(iso)).toBe("Yesterday");
  });

  it("shows a full date further in the past", () => {
    const iso = new Date(NOW.getTime() - 10 * 24 * 60 * 60_000).toISOString();
    const result = formatDateDivider(iso);
    expect(result).not.toBe("Today");
    expect(result).not.toBe("Yesterday");
  });
});

describe("initialsFromName", () => {
  it("takes the first letter of the first two words for a full name", () => {
    expect(initialsFromName("Nour Khalil")).toBe("NK");
  });

  it("takes the first two letters of a single word", () => {
    expect(initialsFromName("Cher")).toBe("CH");
  });

  it("ignores extra whitespace between words", () => {
    expect(initialsFromName("  Rania   Saab  ")).toBe("RS");
  });

  it('falls back to "?" for an empty string', () => {
    expect(initialsFromName("")).toBe("?");
    expect(initialsFromName("   ")).toBe("?");
  });

  it("uses only the first two words for a longer name", () => {
    expect(initialsFromName("Jean Paul Gaultier")).toBe("JP");
  });
});
