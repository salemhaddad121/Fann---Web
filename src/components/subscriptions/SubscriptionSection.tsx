"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { activateSubscription, getMySubscriptions } from "@/lib/subscriptions-api";
import { formatRemaining, planLabel } from "@/lib/subscription-format";
import type { MySubscriptions, SubscriptionRow } from "@/types/subscriptions";

function shortDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function HistoryRow({ row }: { row: SubscriptionRow }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-2.5 text-sm">
      <span className="capitalize text-ink">{planLabel(row.plan_code)}</span>
      <span className="text-xs text-faint">
        {shortDate(row.starts_at)} – {shortDate(row.expires_at)}
      </span>
    </div>
  );
}

export function SubscriptionSection() {
  const [data, setData] = useState<MySubscriptions | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    try {
      setData(await getMySubscriptions());
    } catch {
      setData(null);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleActivate(id: string) {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      const started = await activateSubscription(id);
      setNotice(`Day pass started — ${formatRemaining(started.expires_at)}.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start that pass.");
    } finally {
      setBusyId(null);
    }
  }

  if (!data) return null;

  const { active, queued, credits, history } = data;
  const hasAnything = active || queued.length > 0 || credits.available > 0 || history.length > 0;

  return (
    <div>
      {error && <p className="mb-2 text-sm text-danger">{error}</p>}
      {notice && <p className="mb-2 text-sm text-success">{notice}</p>}

      {active ? (
        <div className="mb-3 rounded-[10px] border border-hairline bg-surface px-3.5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold capitalize text-ink">
              {planLabel(active.plan_code)}
            </span>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-success">
              Active
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {formatRemaining(active.expires_at)} · ends {shortDate(active.expires_at)}
          </p>
        </div>
      ) : (
        <p className="mb-3 text-sm text-muted">No plan running right now.</p>
      )}

      {queued.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-faint">
            Queued
          </p>
          {queued.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between border-b border-hairline py-2 text-sm"
            >
              <span className="capitalize text-ink">{planLabel(row.plan_code)}</span>
              {/* Queued rows have no expiry yet — it is set when they are
                  promoted, so only the projected start is meaningful. */}
              <span className="text-xs text-faint">starts ~{shortDate(row.starts_at)}</span>
            </div>
          ))}
        </div>
      )}

      {credits.available > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-faint">
            Unused day passes · {credits.available}
          </p>
          {credits.rows.map((row, index) => (
            <div
              key={row.id}
              className="flex items-center justify-between border-b border-hairline py-2 text-sm"
            >
              <span className="text-ink">Day pass {index + 1}</span>
              <button
                type="button"
                disabled={busyId !== null || Boolean(active)}
                onClick={() => handleActivate(row.id)}
                title={
                  active
                    ? "You already have a plan running — this would be wasted."
                    : undefined
                }
                className="rounded-lg border border-hairline px-2.5 py-1 text-xs font-semibold text-clay-deep disabled:opacity-40"
              >
                {busyId === row.id ? "Starting…" : "Start"}
              </button>
            </div>
          ))}
          <p className="mt-1.5 text-[11px] text-faint">
            Passes never expire while unused. The 24 hours begins when you start one.
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-faint">
            Past plans
          </p>
          {history.map((row) => (
            <HistoryRow key={row.id} row={row} />
          ))}
        </div>
      )}

      {!hasAnything && (
        <p className="mb-3 text-xs text-faint">
          You haven&apos;t bought a plan yet.
        </p>
      )}

      <Link href="/plans" className="text-sm font-semibold text-clay-deep underline">
        {hasAnything ? "Buy another plan" : "See plans"} →
      </Link>
    </div>
  );
}
