"use client";

import type { Dispatch, SetStateAction } from "react";
import { BOOKER_TYPES } from "@/types/planners";
import { BOOKER_INTERESTS, type BookerInterest, type PlannerKind } from "@/types/auth";

/**
 * The three questions a booker answers at signup.
 *
 * Asked here because signup is the one moment completion rates are highest,
 * and because everything downstream depends on the answers: who can find
 * whom (the artist-facing directory lists companies only), what admin sees,
 * and what the advertising product can ever target.
 *
 * Revealed progressively inside the existing form rather than split across
 * separate screens. The specification calls this "a short stepper"; a
 * single form that grows as it is answered gets the same effect — a booker
 * never sees a question that does not apply to them — without adding
 * abandonment points between screens or a part-filled state to lose. The
 * artist branch is untouched and stays exactly one step, which is the part
 * that actually matters: artists are the supply side and every extra field
 * costs roster.
 */

const KINDS: { value: PlannerKind; label: string; blurb: string }[] = [
  {
    value: "individual",
    label: "Just me",
    blurb: "A wedding, a birthday, a private party",
  },
  {
    value: "company",
    label: "A company",
    blurb: "A venue, a restaurant, an events business",
  },
];

const INTEREST_LABELS: Record<BookerInterest, { label: string; blurb: string }> = {
  musical_acts: { label: "Musical acts", blurb: "Bands, singers, oud, jazz, dabke" },
  performance_acts: { label: "Performance acts", blurb: "MCs, dancers, magicians, comedy" },
  photo_video: { label: "Photo & video", blurb: "Photographers, videographers, booths" },
  djs_and_services: {
    label: "DJs, bartenders & event services",
    blurb: "DJs, bar service, catering, sound & lighting",
  },
  venues: { label: "Venues & spaces", blurb: "Rooms and spaces to hire for the event" },
};

export function BookerQuestions({
  plannerKind,
  onPlannerKindChange,
  bookerType,
  onBookerTypeChange,
  interests,
  onInterestsChange,
  errors,
}: {
  plannerKind: PlannerKind | null;
  onPlannerKindChange: (next: PlannerKind) => void;
  bookerType: string;
  onBookerTypeChange: (next: string) => void;
  interests: BookerInterest[];
  // A state setter rather than a plain callback, so the toggle below can
  // update functionally. With a plain callback it read the `interests`
  // prop captured at render, and two clicks landing before React
  // re-rendered both saw the same stale array — so the second overwrote
  // the first and only one selection survived. Found by ticking two
  // buttons programmatically; a human clicking slowly would never have
  // hit it, and it would have shipped.
  onInterestsChange: Dispatch<SetStateAction<BookerInterest[]>>;
  errors: Record<string, string>;
}) {
  function toggleInterest(value: BookerInterest) {
    onInterestsChange((current) =>
      current.includes(value)
        ? current.filter((i) => i !== value)
        : [...current, value],
    );
  }

  return (
    <>
      {/* 1 — individual or company. Everything else follows from it. */}
      <fieldset className="mb-4 border-0 p-0">
        <legend className="mb-1.5 block text-xs font-semibold text-ink">
          Who are you booking for?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((opt) => {
            const active = plannerKind === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => onPlannerKindChange(opt.value)}
                aria-pressed={active}
                className={`rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
                  active ? "border-[#e0a570] bg-sand" : "border-hairline bg-surface"
                }`}
              >
                <span
                  className={`block text-sm font-semibold ${active ? "text-clay" : "text-ink"}`}
                >
                  {opt.label}
                </span>
                <span className="mt-0.5 block text-xs text-faint">{opt.blurb}</span>
              </button>
            );
          })}
        </div>
        {errors.plannerKind && (
          <p className="mt-1 text-xs text-danger">{errors.plannerKind}</p>
        )}
      </fieldset>

      {/* 2 — only for a company. An individual has no organisation type and
          asking would be nonsense, which is why this appears rather than
          sitting there greyed out. */}
      {plannerKind === "company" && (
        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-ink">
            What kind of organisation?
          </span>
          <select
            name="bookerType"
            value={bookerType}
            onChange={(e) => onBookerTypeChange(e.target.value)}
            aria-invalid={!!errors.bookerType}
            className="w-full rounded-[10px] border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-clay"
          >
            <option value="">Choose one…</option>
            {BOOKER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.bookerType && (
            <span className="mt-1 block text-xs text-danger">{errors.bookerType}</span>
          )}
        </label>
      )}

      {/* 3 — what they came for. Multi-select, minimum one: single-select
          would misdescribe most real bookings, where a wedding wants a band
          AND a photographer AND a DJ. */}
      <fieldset className="mb-4 border-0 p-0">
        <legend className="mb-1.5 block text-xs font-semibold text-ink">
          What are you looking for?{" "}
          <span className="font-normal text-faint">Choose any that apply</span>
        </legend>
        <div className="flex flex-col gap-2">
          {BOOKER_INTERESTS.map((value) => {
            const active = interests.includes(value);
            const copy = INTEREST_LABELS[value];
            return (
              <button
                type="button"
                key={value}
                onClick={() => toggleInterest(value)}
                aria-pressed={active}
                className={`flex items-start gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
                  active ? "border-[#e0a570] bg-sand" : "border-hairline bg-surface"
                }`}
              >
                {/* A drawn box rather than two icon glyphs. The obvious
                    square/square-check pair is not in the subsetted font —
                    check:icons catches that, and it also reads icon names
                    out of comments, so do not name them here. A box built
                    from a border needs no glyph for its empty state. */}
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    active ? "border-clay bg-clay text-white" : "border-hairline bg-surface"
                  }`}
                  aria-hidden
                >
                  {active && <i className="ti ti-check text-[13px]" />}
                </span>
                <span>
                  <span
                    className={`block text-sm font-semibold ${active ? "text-clay" : "text-ink"}`}
                  >
                    {copy.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-faint">{copy.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
        {errors.interests && <p className="mt-1 text-xs text-danger">{errors.interests}</p>}
      </fieldset>
    </>
  );
}
