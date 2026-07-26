"use client";

import { useEffect, useState } from "react";
import {
  getSignupTrend,
  getGeographyBreakdown,
  getTopBookedCategories,
  getTopBookerTypes,
} from "@/lib/admin-api";
import type {
  SignupTrendPoint,
  GeographyRow,
  BookedCategoryRow,
  BookerTypeRow,
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

export function AnalyticsTab() {
  const [trend, setTrend] = useState<SignupTrendPoint[] | null>(null);
  const [geography, setGeography] = useState<GeographyRow[] | null>(null);
  const [bookedCategories, setBookedCategories] = useState<BookedCategoryRow[] | null>(null);
  const [bookerTypes, setBookerTypes] = useState<BookerTypeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getSignupTrend(30),
      getGeographyBreakdown(),
      getTopBookedCategories(),
      getTopBookerTypes(),
    ])
      .then(([t, g, c, b]) => {
        if (cancelled) return;
        setTrend(t);
        setGeography(g);
        setBookedCategories(c);
        setBookerTypes(b);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load analytics.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!trend || !geography || !bookedCategories || !bookerTypes) {
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
        Time spent on the app, time on the search page, page views and conversion rate
        aren&apos;t shown — nothing records a page view or a session, so there is no data behind
        them. Everything above is derived from rows that already exist: signup timestamps,
        profile cities, and bookings.
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
