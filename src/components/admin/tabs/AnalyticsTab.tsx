"use client";

import { useEffect, useState } from "react";
import {
  getSignupTrend,
  getGeographyBreakdown,
  getTopBookedCategories,
  getTopBookerTypes,
  getEngagement,
} from "@/lib/admin-api";
import type {
  SignupTrendPoint,
  GeographyRow,
  BookedCategoryRow,
  BookerTypeRow,
  EngagementStats,
  EngagementRow,
} from "@/types/admin";

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

// Shared bar row — same shape as the city list, reused for both booking
// breakdowns so the three sections read as one thing.
function RankedBars({
  data,
  accent = "bg-indigo",
}: {
  data: { label: string; count: number }[];
  accent?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex flex-col gap-2">
      {data.map((row) => (
        <div key={row.label} className="flex items-center gap-2.5">
          <span className="text-xs text-ink w-28 truncate shrink-0" title={row.label}>
            {row.label}
          </span>
          <div className="flex-1 h-2 bg-mist rounded-full overflow-hidden">
            <div
              className={`h-full ${accent} rounded-full`}
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-faint w-8 text-right shrink-0">{row.count}</span>
        </div>
      ))}
    </div>
  );
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "—";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function EngagementGrid({ rows, label }: { rows: EngagementRow[]; label: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-faint">No {label} recorded yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {rows.map((r) => (
        <div key={r.role} className="border border-hairline rounded-xl p-3">
          <p className="text-[11px] text-faint capitalize mb-0.5">
            {r.role === "planner" ? "Bookers" : "Artists"}
          </p>
          <p className="text-lg font-bold text-ink leading-tight">
            {formatDuration(r.avgMsPerActiveDay)}
          </p>
          <p className="text-[10px] text-faint mt-0.5">
            per active day · {r.users} {r.users === 1 ? "person" : "people"}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsTab() {
  const [trend, setTrend] = useState<SignupTrendPoint[] | null>(null);
  const [geography, setGeography] = useState<GeographyRow[] | null>(null);
  const [bookedCategories, setBookedCategories] = useState<BookedCategoryRow[] | null>(null);
  const [bookerTypes, setBookerTypes] = useState<BookerTypeRow[] | null>(null);
  const [engagement, setEngagement] = useState<EngagementStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getSignupTrend(30),
      getGeographyBreakdown(),
      getTopBookedCategories(),
      getTopBookerTypes(),
      getEngagement(),
    ])
      .then(([t, g, c, b, e]) => {
        if (cancelled) return;
        setTrend(t);
        setGeography(g);
        setBookedCategories(c);
        setBookerTypes(b);
        setEngagement(e);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load analytics.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!trend || !geography || !bookedCategories || !bookerTypes || !engagement) {
    return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  }

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

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold text-ink">Time in the app</p>
          <span className="text-xs text-faint">last {engagement.windowDays} days</span>
        </div>
        <EngagementGrid rows={engagement.overall} label="activity" />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold text-ink">Time on the search page</p>
          <span className="text-xs text-faint">last {engagement.windowDays} days</span>
        </div>
        <EngagementGrid rows={engagement.search} label="search activity" />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold text-ink">Most booked artist categories</p>
          <span className="text-xs text-faint">top 5</span>
        </div>
        {bookedCategories.length === 0 ? (
          <p className="text-sm text-faint">No confirmed bookings yet.</p>
        ) : (
          <RankedBars data={bookedCategories.map((r) => ({ label: r.category, count: r.count }))} />
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold text-ink">Who is booking</p>
          <span className="text-xs text-faint">top 3</span>
        </div>
        {bookerTypes.length === 0 ? (
          <p className="text-sm text-faint">No confirmed bookings yet.</p>
        ) : (
          <RankedBars
            data={bookerTypes.map((r) => ({ label: r.bookerType, count: r.count }))}
            accent="bg-sky"
          />
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
        Time figures count FOREGROUND time only — a tab left open in the background does not
        accrue. They are an average per active day: someone with no activity in the window is
        excluded rather than counted as zero, so this measures how long engaged people stay,
        not how many show up. Collection started when page_events was added, so the window
        fills in gradually. Delivery is best-effort, so treat these as directional.
        <br />
        <br />
        Page views and conversion rate still aren&apos;t shown — nothing records a funnel step.
        <br />
        <br />
        Booking figures count confirmed bookings only (accepted and completed) — a declined or
        cancelled booking isn&apos;t one, and a pending one isn&apos;t yet. An artist can hold
        several categories, so one booking counts toward each of theirs; the category numbers
        answer &ldquo;how many bookings involved this category&rdquo; and won&apos;t sum to the
        total.
      </p>
    </div>
  );
}
