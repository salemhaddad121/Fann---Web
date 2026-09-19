import { BOOKER_INTEREST_OPTIONS } from "@/types/auth";
import type { BookerInterestRow } from "@/types/admin";

/** One bar in the admin dashboard's "What bookers came for" panel. */
export interface InterestBarRow {
  /** The human label, or the raw slug for a bucket this build doesn't know. */
  label: string;
  total: number;
  individual: number;
  company: number;
  /**
   * Bookers counted in `total` but in neither split — they answered the
   * interest question before the individual/company one existed. Kept as
   * its own number rather than filed under individual, which would invent
   * data, or dropped, which would make the splits not add up to the total.
   */
  unknownKind: number;
  /** Share of ANSWERING bookers, straight from the API. */
  share: number;
}

/**
 * Turn the API's buckets into one row per bar.
 *
 * Every known bucket gets a row even when nobody picked it: a zero is an
 * answer ("nobody is coming here for venues"), and a bucket that quietly
 * disappears from the list can't be read as one. A bucket the API knows and
 * this build doesn't — one added server-side before the web caught up — is
 * kept under its raw slug rather than dropped, so the panel never shows a
 * subset of the data while looking complete.
 */
export function buildInterestRows(interests: BookerInterestRow[]): InterestBarRow[] {
  const byInterest = new Map(interests.map((r) => [r.interest, r]));

  const known = BOOKER_INTEREST_OPTIONS.map((o) => ({
    label: o.label,
    row: byInterest.get(o.value),
  }));

  const unknown = interests
    .filter((r) => !BOOKER_INTEREST_OPTIONS.some((o) => o.value === r.interest))
    .map((r) => ({ label: r.interest, row: r }));

  return [...known, ...unknown]
    .map(({ label, row }) => {
      const total = row?.total ?? 0;
      const individual = row?.individual ?? 0;
      const company = row?.company ?? 0;
      return {
        label,
        total,
        individual,
        company,
        unknownKind: Math.max(0, total - individual - company),
        share: row?.share ?? 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}
