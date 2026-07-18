import { describe, it, expect } from "vitest";
import { badgeColor } from "./badge-colors";

describe("badgeColor", () => {
  it("is deterministic — the same label always gets the same color", () => {
    expect(badgeColor("Nour Khalil")).toBe(badgeColor("Nour Khalil"));
  });

  it("returns one of the known palette values", () => {
    const result = badgeColor("Anything");
    expect(result).toMatch(/^bg-\[#[0-9A-F]{6}\] text-\[#[0-9A-F]{6}\]$/i);
  });

  it("handles an empty string without throwing", () => {
    expect(() => badgeColor("")).not.toThrow();
  });
});
