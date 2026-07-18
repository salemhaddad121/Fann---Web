"use client";

import { useEffect, useState } from "react";
import { getSignupTrend, getGeographyBreakdown } from "@/lib/admin-api";
import type { SignupTrendPoint, GeographyRow } from "@/types/admin";

function SignupChart({ data }: { data: SignupTrendPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.artists + d.planners));

  return (
    <div>
      <div className="flex items-end gap-[3px] h-32 mb-2">
        {data.map((d) => {
          const artistH = (d.artists / max) * 100;
          const plannerH = (d.planners / max) * 100;
          const total = d.artists + d.planners;
          return (
            <div key={d.date} className="flex-1 flex flex-col-reverse h-full" title={`${d.date}: ${total} signup${total === 1 ? "" : "s"}`}>
              {plannerH > 0 && <div className="bg-sky rounded-t-[1px]" style={{ height: `${plannerH}%` }} />}
              {artistH > 0 && (
                <div
                  className={`bg-indigo ${plannerH === 0 ? "rounded-t-[1px]" : ""}`}
                  style={{ height: `${artistH}%` }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo" /> Artists
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky" /> Planners
        </span>
      </div>
    </div>
  );
}

function GeographyList({ data }: { data: GeographyRow[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex flex-col gap-2">
      {data.map((row) => (
        <div key={row.city} className="flex items-center gap-2.5">
          <span className="text-xs text-ink w-24 truncate shrink-0">{row.city}</span>
          <div className="flex-1 h-2 bg-mist rounded-full overflow-hidden">
            <div className="h-full bg-indigo rounded-full" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
          <span className="text-xs text-faint w-8 text-right shrink-0">{row.count}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsTab() {
  const [trend, setTrend] = useState<SignupTrendPoint[] | null>(null);
  const [geography, setGeography] = useState<GeographyRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSignupTrend(30), getGeographyBreakdown()])
      .then(([t, g]) => {
        if (cancelled) return;
        setTrend(t);
        setGeography(g);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load analytics.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!trend || !geography) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  const totalSignups = trend.reduce((sum, d) => sum + d.artists + d.planners, 0);

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold text-ink">Signups — last 30 days</p>
          <span className="text-xs text-faint">{totalSignups} total</span>
        </div>
        {totalSignups === 0 ? (
          <p className="text-sm text-faint">No signups in this window yet.</p>
        ) : (
          <SignupChart data={trend} />
        )}
      </div>

      <div className="mb-4">
        <p className="text-[13px] font-bold text-ink mb-3">Top cities</p>
        {geography.length === 0 ? (
          <p className="text-sm text-faint">No profiles with a city set yet.</p>
        ) : (
          <GeographyList data={geography} />
        )}
      </div>

      <p className="text-[11px] text-faint pt-3 border-t border-hairline leading-relaxed">
        Page views and conversion rate aren&apos;t shown here — nothing in the backend logs a page
        view or a signup funnel step, so there&apos;s no real data to chart. These two are derived
        entirely from real signup timestamps and profile city fields already in the database.
      </p>
    </div>
  );
}
