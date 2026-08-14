import { describe, expect, it } from "vitest";
import { formatRemaining, planLabel } from "./subscription-format";

const NOW = new Date("2026-08-15T12:00:00Z").getTime();
const at = (iso: string) => formatRemaining(iso, NOW);

describe("formatRemaining()", () => {
  it("counts whole days for a long plan", () => {
    expect(at("2026-09-14T12:00:00Z")).toBe("30 days left");
  });

  it("switches to hours inside the last day", () => {
    // The day pass is why this exists: "0 days left" on something with four
    // hours to run reads as broken exactly when the number matters most.
    expect(at("2026-08-15T16:00:00Z")).toBe("4 hours left");
  });

  it("switches to minutes inside the last hour", () => {
    expect(at("2026-08-15T12:20:00Z")).toBe("20 minutes left");
  });

  it("never rounds a live subscription down to zero", () => {
    expect(at("2026-08-15T12:00:30Z")).toBe("1 minute left");
  });

  it("singularises correctly", () => {
    expect(at("2026-08-16T12:00:00Z")).toBe("1 day left");
    expect(at("2026-08-15T13:00:00Z")).toBe("1 hour left");
  });

  it("reports an elapsed expiry as expired", () => {
    expect(at("2026-08-15T11:59:00Z")).toBe("expired");
  });

  it("returns nothing for a queued row, which has no expiry yet", () => {
    expect(formatRemaining(null, NOW)).toBe("");
  });

  it("returns nothing for an unparseable date", () => {
    expect(formatRemaining("not-a-date", NOW)).toBe("");
  });
});

describe("planLabel()", () => {
  it("reads naturally in a sentence", () => {
    expect(planLabel("day")).toBe("day pass");
    expect(planLabel("month")).toBe("monthly plan");
    expect(planLabel("year")).toBe("yearly plan");
  });

  it("falls back to the raw code for anything unexpected", () => {
    expect(planLabel("lifetime")).toBe("lifetime");
  });
});
