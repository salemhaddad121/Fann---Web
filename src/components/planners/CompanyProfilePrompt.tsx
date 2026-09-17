"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyPlannerProfile } from "@/lib/planners-api";
import type { PlannerDetail } from "@/types/planners";

/**
 * Asks a company booker to fill in their profile, once.
 *
 * Not vanity. A company booker's profile is what makes them findable by
 * artists pitching collaborations, and that is a large part of what the
 * yearly plan buys — the artist-facing directory lists companies and only
 * companies.
 *
 * An individual never sees this, and the copy says so out loud. That
 * sentence is the disclosure that makes the directory rule fair: a private
 * person signing up to book a birthday is told, in the product, that they
 * are not listed anywhere. It should say the same thing in the Privacy
 * Policy, which is with the legal team.
 */

const DISMISS_KEY = "fann.companyProfilePrompt.dismissed";

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    // Private windows, blocked site data, thumbnail capture. An unreadable
    // store means "not dismissed", which shows the card again rather than
    // hiding something the user has not seen.
    return false;
  }
}

export function CompanyProfilePrompt() {
  // One piece of state, set once, in the promise callback.
  //
  // The dismissal flag is read alongside the profile rather than in its own
  // setState at the top of the effect. localStorage does not exist during a
  // server render, so it cannot be a lazy initial value without the first
  // client render disagreeing with the server's — and a synchronous
  // setState in an effect body is what react-hooks/set-state-in-effect
  // exists to stop. Setting both together in the callback satisfies both
  // constraints, and is the pattern the other banners here already use.
  const [state, setState] = useState<{
    profile: PlannerDetail;
    dismissed: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyPlannerProfile()
      .then((profile) => {
        if (!cancelled) setState({ profile, dismissed: readDismissed() });
      })
      .catch(() => {
        // A failed load hides the card rather than showing an error on a
        // dashboard that is otherwise fine. Same choice SubscriptionBanner
        // makes.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    setState((current) => (current ? { ...current, dismissed: true } : current));
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Dismissal then lasts the session rather than for ever. Better than
      // refusing to close a card because storage is unavailable.
    }
  }

  if (!state || state.dismissed) return null;
  const { profile } = state;
  // Individuals are never listed, so there is nothing to prompt them for.
  if (profile.planner_kind !== "company") return null;
  // Already done it. display_name is what the directory shows, so that is
  // the thing being asked for.
  if (profile.display_name) return null;

  return (
    <div className="mb-4 rounded-2xl border border-hairline bg-surface p-5">
      <p className="text-[12px] font-bold uppercase tracking-wide text-clay-deep">
        One thing left
      </p>
      <p className="mt-1 text-base font-bold text-ink">
        Add your company profile so artists can find you
      </p>
      <p className="mt-1.5 text-sm text-muted">
        Artists browsing Fann can look up venues and event companies and reach out about
        collaborations. Individuals are never listed.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Link
          href="/profile/edit"
          className="rounded-[10px] bg-clay-deep px-4 py-2.5 text-sm font-semibold text-white"
        >
          Add your profile
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="text-sm font-semibold text-muted underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
