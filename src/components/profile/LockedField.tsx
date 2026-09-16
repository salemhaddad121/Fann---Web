"use client";

import Link from "next/link";
import type { ViewerTier } from "@/types/artists";

/**
 * Placeholder for a field the server withheld.
 *
 * Worth being precise about what this is and is not: it is NOT a blur over
 * the real value. The server never sends these fields below the paying
 * tier, so there is nothing here to reveal with devtools — the smudge is
 * decoration over an empty box. Doing it the other way round, shipping the
 * value and hiding it in CSS, would mean the paywall could be lifted by
 * anyone who opens the network tab.
 *
 * `aria-hidden` on the smudge and a real text label underneath keep it
 * legible to a screen reader, which otherwise announces nothing at all.
 */
export function LockedField({
  label,
  tier,
  lines = 1,
}: {
  label: string;
  tier?: ViewerTier;
  lines?: number;
}) {
  const isGuest = tier !== "registered";

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-wide text-faint">{label}</p>

      <div className="mt-1 flex items-start gap-2">
        <div aria-hidden className="flex-1 space-y-1.5">
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className="h-3.5 rounded bg-hairline/70 blur-[3px]"
              style={{ width: i === lines - 1 && lines > 1 ? "60%" : "100%" }}
            />
          ))}
        </div>
        <i className="ti ti-lock mt-0.5 shrink-0 text-sm text-faint" aria-hidden />
      </div>

      <Link
        href={isGuest ? "/auth/login" : "/plans"}
        className="mt-1 inline-block text-xs font-semibold text-clay-deep underline"
      >
        {isGuest ? "Sign in to view" : "Unlock with a plan"}
      </Link>
    </div>
  );
}

/**
 * The blurred stand-in for an artist's name.
 *
 * Same principle as LockedField and worth repeating, because a blurred name
 * is the one place where doing it the wrong way looks identical: the server
 * sends no name below the paying tier, so this is a smudge over an EMPTY
 * BOX. It is not the real name behind a CSS filter — that version can be
 * read straight out of the network tab, and the blur would be theatre.
 *
 * Consequently the bar is the same on every profile. It carries no width or
 * shape derived from the hidden name, because deriving anything from a value
 * is how a value leaks: a bar sized to the real name would let someone read
 * its length off the page and narrow their guesses.
 *
 * `onDark` is for the gradient banner over a search card's photo, where the
 * surrounding text is white.
 */
export function LockedName({
  onDark = false,
  width = "7rem",
}: {
  onDark?: boolean;
  width?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={`inline-block rounded blur-[3px] ${
          onDark ? "bg-white/55" : "bg-hairline"
        }`}
        style={{ width, height: "0.85em" }}
      />
      <i
        className={`ti ti-lock shrink-0 text-[0.75em] ${onDark ? "text-white/80" : "text-faint"}`}
        aria-hidden
      />
      {/* The only thing a screen reader gets — the smudge announces nothing. */}
      <span className="sr-only">Artist name hidden. Subscribe to see it.</span>
    </span>
  );
}

/**
 * The persistent prompt on a locked profile.
 *
 * Sticky because the reason someone is on this page is to make contact, and
 * that is exactly what is withheld — so the way out has to stay in reach
 * rather than sitting at the bottom of a long profile.
 */
export function UnlockCta({ tier }: { tier?: ViewerTier }) {
  if (tier === "subscribed") return null;
  // Signed in but not subscribed. Matters only for the Play-app fallback
  // below — the web offer is the same for both tiers.
  const isRegistered = tier === "registered";

  /*
   * One ask, not two.
   *
   * The guest version used to read "Sign in and pick a plan to see the full
   * name, contact details and to message." over a button labelled "Sign in"
   * — two requests in one bar, and the button named the smaller one. What
   * is actually on offer is the plan; signing in is a step on the way to
   * it, and /plans handles that step itself.
   *
   * So both tiers now get the same offer and the same destination, and the
   * button carries the price, because "from $5" is the fact that decides
   * whether the tap is worth making.
   *
   * That $5 is written here rather than read from the plan list: this bar
   * renders on every locked profile view and is not worth a request for one
   * number. It is therefore a figure that can drift — if the day pass price
   * moves, this string has to move with it. Logged in ISSUES.md.
   */
  return (
    <div className="sticky bottom-0 z-20 border-t border-hairline bg-surface/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <p className="text-[13px] leading-snug text-muted">
          A plan unlocks the full name, contact details and messaging.
        </p>
        <Link
          href="/plans"
          className="shrink-0 rounded-[10px] bg-clay-deep px-4 py-2.5 text-sm font-semibold text-white"
        >
          See plans — from $5
        </Link>
        {/* Inside the Play app the link above is hidden by the global
            href-matching rule, which would otherwise leave this bar as a
            sentence with no way out of it. This is the same bar's action
            for that context, and it is hidden everywhere else. See the
            .is-twa block in globals.css.

            Guests only. This first shipped ungated, which meant a signed-in
            planner who simply has no plan — the ordinary in-app cohort,
            since Play's billing policy means they can never buy in the app
            — was shown a button telling them to sign in, landing on a login
            form that does not redirect an authenticated user. That is the
            same two-asks-in-one-bar mismatch this item existed to remove.
            There is no in-app action for that tier, so they get the
            sentence and no button, which is the honest answer. */}
        {!isRegistered && (
          <Link
            href="/auth/login"
            className="twa-only shrink-0 rounded-[10px] bg-clay-deep px-4 py-2.5 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
