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
      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</p>

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
 * The persistent prompt on a locked profile.
 *
 * Sticky because the reason someone is on this page is to make contact, and
 * that is exactly what is withheld — so the way out has to stay in reach
 * rather than sitting at the bottom of a long profile.
 */
export function UnlockCta({ tier }: { tier?: ViewerTier }) {
  if (tier === "subscribed") return null;
  const isGuest = tier !== "registered";

  return (
    <div className="sticky bottom-0 z-20 border-t border-hairline bg-surface/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <p className="text-[13px] leading-snug text-muted">
          {isGuest
            ? "Sign in and pick a plan to see the full name, contact details and to message."
            : "A plan unlocks the full name, contact details and messaging — from $5."}
        </p>
        <Link
          href={isGuest ? "/auth/login" : "/plans"}
          className="shrink-0 rounded-[10px] bg-clay-deep px-4 py-2.5 text-sm font-semibold text-white"
        >
          {isGuest ? "Sign in" : "See plans"}
        </Link>
      </div>
    </div>
  );
}
