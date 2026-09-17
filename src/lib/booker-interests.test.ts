import { describe, it, expect } from "vitest";
import { buildInterestRows } from "./booker-interests";
import { BOOKER_INTEREST_OPTIONS } from "@/types/auth";
import type { BookerInterestRow } from "@/types/admin";

function row(over: Partial<BookerInterestRow> & { interest: string }): BookerInterestRow {
  return { total: 0, individual: 0, company: 0, share: 0, ...over };
}

describe("buildInterestRows", () => {
  it("renders every known bucket even when nobody picked it", () => {
    const rows = buildInterestRows([
      row({ interest: "photo_video", total: 3, individual: 3, share: 1 }),
    ]);

    expect(rows).toHaveLength(BOOKER_INTEREST_OPTIONS.length);
    // A bucket nobody chose is a finding, not an absence — it has to be on
    // screen as a zero rather than missing from the list.
    expect(rows.find((r) => r.label === "Venues & spaces")).toMatchObject({ total: 0, share: 0 });
  });

  it("labels buckets in words, not slugs", () => {
    const rows = buildInterestRows([row({ interest: "photo_video", total: 1 })]);
    expect(rows.map((r) => r.label)).toContain("Photo & video");
    expect(rows.map((r) => r.label)).not.toContain("photo_video");
  });

  it("sorts by total, biggest first", () => {
    const rows = buildInterestRows([
      row({ interest: "musical_acts", total: 2 }),
      row({ interest: "venues", total: 9 }),
      row({ interest: "photo_video", total: 5 }),
    ]);

    expect(rows.slice(0, 3).map((r) => r.label)).toEqual([
      "Venues & spaces",
      "Photo & video",
      "Musical acts",
    ]);
  });

  it("keeps a bucket the API knows and this build does not", () => {
    // A bucket added server-side before the web catches up. Dropping it
    // would leave the panel looking complete while hiding real demand.
    const rows = buildInterestRows([row({ interest: "catering_only", total: 40, share: 0.8 })]);

    expect(rows[0]).toMatchObject({ label: "catering_only", total: 40, share: 0.8 });
    expect(rows).toHaveLength(BOOKER_INTEREST_OPTIONS.length + 1);
  });

  it("gives bookers with no kind their own segment rather than calling them individuals", () => {
    const rows = buildInterestRows([
      row({ interest: "musical_acts", total: 10, individual: 4, company: 3 }),
    ]);

    const musical = rows.find((r) => r.label === "Musical acts");
    expect(musical).toMatchObject({ individual: 4, company: 3, unknownKind: 3 });
    // The three segments have to account for the whole bar, or the bar is
    // silently shorter than the number printed beside it.
    expect(musical!.individual + musical!.company + musical!.unknownKind).toBe(musical!.total);
  });

  it("never reports a negative unknown segment", () => {
    // Splits summing over the total should not flip the bar inside out.
    const rows = buildInterestRows([
      row({ interest: "venues", total: 2, individual: 2, company: 2 }),
    ]);

    expect(rows.find((r) => r.label === "Venues & spaces")!.unknownKind).toBe(0);
  });

  it("returns a zeroed row per bucket on an empty platform", () => {
    const rows = buildInterestRows([]);

    expect(rows).toHaveLength(BOOKER_INTEREST_OPTIONS.length);
    expect(rows.every((r) => r.total === 0 && r.share === 0)).toBe(true);
  });
});
