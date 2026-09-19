import { describe, it, expect } from "vitest";
import { badgeColor } from "./badge-colors";

// The palette as the component sees it. Kept here rather than exported from
// badge-colors.ts so the module's public surface stays one function.
const PALETTE = ["bg-teal text-white", "bg-card-plum text-white", "bg-card-indigo text-white"];

describe("badgeColor", () => {
  it("is deterministic — the same label always gets the same color", () => {
    expect(badgeColor("Nour Khalil")).toBe(badgeColor("Nour Khalil"));
  });

  // This used to assert the SHAPE of the string — two arbitrary hex values —
  // which pinned the implementation rather than the contract and broke the
  // day the palette moved to colour tokens. What callers actually rely on is
  // that the return value is one of the palette entries, so that is what is
  // checked, against the palette itself.
  it("returns one of the known palette values", () => {
    expect(PALETTE).toContain(badgeColor("Anything"));
  });

  it("covers the whole palette across enough labels", () => {
    const seen = new Set(
      Array.from({ length: 200 }, (_, i) => badgeColor(`label-${i}`)),
    );
    expect([...seen].sort()).toEqual([...PALETTE].sort());
  });

  it("handles an empty string without throwing", () => {
    expect(() => badgeColor("")).not.toThrow();
  });
});
