"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { activateSubscription, getMySubscriptions } from "@/lib/subscriptions-api";
import { formatRemaining, planLabel } from "@/lib/subscription-format";
import type { MySubscriptions } from "@/types/subscriptions";

/**
 * Dashboard summary of where the booker stands.
 *
 * Four states, and they are genuinely different situations rather than
 * variations on one: running, banked-but-not-started, nothing, and the
 * stacked case where something is running with another period behind it.
 */
export function SubscriptionBanner() {
  const [data, setData] = useState<MySubscriptions | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setData(await getMySubscriptions());
    } catch {
      // A failed load leaves the banner hidden rather than showing an error
      // block on a dashboard that is otherwise fine.
      setData(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    getMySubscriptions()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleActivate(id: string) {
    setBusy(true);
    setError(null);
    try {
      await activateSubscription(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start that pass.");
    } finally {
      setBusy(false);
    }
  }

  if (!data) return null;

  const { active, queued, credits } = data;

  // ── Something is running ───────────────────────────────────────────
  if (active) {
    return (
      <div className="mb-4 rounded-2xl border border-hairline bg-ink p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-clay-light">
              Active
            </p>
            <p className="mt-1 text-base font-bold capitalize">
              Your {planLabel(active.plan_code)}
            </p>
            <p className="mt-0.5 text-sm text-white/75">
              {formatRemaining(active.expires_at)}
            </p>
          </div>
          <Link
            href="/search"
            className="shrink-0 rounded-[10px] bg-white px-3.5 py-2 text-[13px] font-semibold text-ink"
          >
            Find artists
          </Link>
        </div>

        {queued.length > 0 && (
          <p className="mt-3 border-t border-white/15 pt-3 text-[13px] text-white/70">
            {queued.length === 1
              ? `Your ${planLabel(queued[0].plan_code)} starts when this one ends.`
              : `${queued.length} more plans are queued behind this one.`}
          </p>
        )}

        {credits.available > 0 && (
          <p className="mt-2 text-[13px] text-white/70">
            {credits.available} day pass{credits.available === 1 ? "" : "es"} banked — they
            keep until you need them.
          </p>
        )}
      </div>
    );
  }

  // ── Nothing running, but credits are banked ────────────────────────
  if (credits.available > 0) {
    const next = credits.rows[0];
    return (
      <div className="mb-4 rounded-2xl border border-hairline bg-surface p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-clay-deep">
          Ready to use
        </p>
        <p className="mt-1 text-base font-bold text-ink">
          {credits.available} day pass{credits.available === 1 ? "" : "es"} waiting
        </p>
        <p className="mt-0.5 text-sm text-muted">
          The 24 hours starts when you say so — not before.
        </p>

        {error && <p className="mt-2 text-sm text-danger">{error}</p>}

        <button
          type="button"
          disabled={busy}
          onClick={() => handleActivate(next.id)}
          className="mt-3 rounded-[10px] bg-clay-deep px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Starting…" : "Start a day pass now"}
        </button>
      </div>
    );
  }

  // ── Nothing at all ─────────────────────────────────────────────────
  return (
    <div className="mb-4 rounded-2xl border border-hairline bg-surface p-5">
      <p className="text-base font-bold text-ink">You&apos;re browsing only</p>
      <p className="mt-1 text-sm text-muted">
        Artist names, contact details and messaging are locked. A plan unlocks
        them — from $5 for 24 hours.
      </p>
      <Link
        href="/plans"
        className="mt-3 inline-block rounded-[10px] bg-clay-deep px-4 py-2.5 text-sm font-semibold text-white"
      >
        See plans
      </Link>
    </div>
  );
}
