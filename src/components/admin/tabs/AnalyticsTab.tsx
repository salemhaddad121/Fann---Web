"use client";

import { useEffect, useState } from "react";
import {
  getSignupTrend,
  getGeographyBreakdown,
  getTopBookedCategories,
  getTopBookerTypes,
  getEngagement,
  getBookerInterests,
} from "@/lib/admin-api";
import type {
  SignupTrendPoint,
  GeographyRow,
  BookedCategoryRow,
  BookerTypeRow,
  BookerInterestStats,
  EngagementStats,
  EngagementRow,
} from "@/types/admin";
import { buildInterestRows } from "@/lib/booker-interests";

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
              {plannerH > 0 && <div className="bg-teal rounded-t-[1px]" style={{ height: `${plannerH}%` }} />}
              {artistH > 0 && (
                <div
                  className={`bg-clay ${plannerH === 0 ? "rounded-t-[1px]" : ""}`}
                  style={{ height: `${artistH}%` }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-clay" /> Artists
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal" /> Planners
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
          <div className="flex-1 h-2 bg-sand rounded-full overflow-hidden">
            <div className="h-full bg-clay rounded-full" style={{ width: `${(row.count / max) * 100}%` }} />
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
  accent = "bg-clay",
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
          <div className="flex-1 h-2 bg-sand rounded-full overflow-hidden">
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

// What bookers said they came for, at signup — the only reader of the
// interest buckets. They filter nobody's search; a booker picks filters on
// the search page like everyone else. This is here so there is an answer to
// "what are people actually coming here to book", which the roster and the
// advertising both depend on.
//
// Bars are scaled to the number of bookers who ANSWERED, not to the biggest
// bucket, so the bar and the percentage beside it say the same thing. Max
// scaling would draw the top bucket as a full bar whatever its real share.
function InterestBreakdown({ stats }: { stats: BookerInterestStats }) {
  const rows = buildInterestRows(stats.interests);

  if (stats.answering === 0) {
    return <p className="text-sm text-faint">No bookers have answered this yet.</p>;
  }

  const width = (n: number) => `${(n / stats.answering) * 100}%`;

  return (
    <div>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2.5">
            <span className="text-xs text-ink w-28 truncate shrink-0" title={r.label}>
              {r.label}
            </span>
            <div className="flex-1 h-2 bg-sand rounded-full overflow-hidden flex">
              {r.individual > 0 && (
                <div className="h-full bg-clay" style={{ width: width(r.individual) }} />
              )}
              {r.company > 0 && (
                <div className="h-full bg-teal" style={{ width: width(r.company) }} />
              )}
              {r.unknownKind > 0 && (
                <div className="h-full bg-faint" style={{ width: width(r.unknownKind) }} />
              )}
            </div>
            {/* Wide enough, and nowrap, for three-digit counts — "120 · 75%"
                wrapping to two lines would break the row's height. */}
            <span className="text-xs text-faint w-[4.5rem] text-right shrink-0 tabular-nums whitespace-nowrap">
              {r.total} · {Math.round(r.share * 100)}%
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-[12px] text-muted mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-clay" /> Individual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal" /> Company
        </span>
        {rows.some((r) => r.unknownKind > 0) && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-faint" /> Not stated
          </span>
        )}
      </div>
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
          <p className="text-[12px] text-faint capitalize mb-0.5">
            {r.role === "planner" ? "Planners" : "Artists"}
          </p>
          <p className="text-lg font-bold text-ink leading-tight">
            {formatDuration(r.avgMsPerActiveDay)}
          </p>
          <p className="text-[12px] text-faint mt-0.5">
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
  const [interests, setInterests] = useState<BookerInterestStats | null>(null);
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
      getBookerInterests(),
    ])
      .then(([t, g, c, b, e, i]) => {
        if (cancelled) return;
        setTrend(t);
        setGeography(g);
        setBookedCategories(c);
        setBookerTypes(b);
        setEngagement(e);
        setInterests(i);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load analytics.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!trend || !geography || !bookedCategories || !bookerTypes || !engagement || !interests) {
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
          <p className="text-[13px] font-bold text-ink">What bookers came for</p>
          <span className="text-xs text-faint">
            {interests.answering} of {interests.totalBookers} answered
          </span>
        </div>
        <InterestBreakdown stats={interests} />
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
            accent="bg-teal"
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

      <p className="text-[12px] text-faint pt-3 border-t border-hairline leading-relaxed">
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
        &ldquo;What bookers came for&rdquo; is what they picked at signup, not what they
        searched for or booked — the buckets steer nothing, bookers filter the search page
        themselves. The question allows several answers, so the counts sum to more than the
        number of bookers; each percentage is the share of bookers who ANSWERED, which is why
        that count is shown rather than the total. Bookers who signed up before the question
        existed are left out of it instead of counted as wanting nothing.
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
