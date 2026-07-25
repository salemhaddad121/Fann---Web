"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyArtistProfile, getMyBookerTypes, type BookerTypeBreakdown } from "@/lib/artists-api";
import { listMyBookings } from "@/lib/bookings-api";
import type { ArtistDetail } from "@/types/artists";
import type { Booking } from "@/types/bookings";

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// event_date arrives as a full ISO timestamp; compare/format on the date key.
function dateKey(d: string): string {
  return d.slice(0, 10);
}
function formatDate(d: string): string {
  const [y, m, day] = dateKey(d).split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function completenessChecks(p: ArtistDetail) {
  return [
    { label: "Bio", done: !!p.bio },
    { label: "Photo", done: (p.media?.length ?? 0) > 0 || !!p.thumbnail_url },
    { label: "Category", done: (p.categories?.length ?? 0) > 0 },
    { label: "Price", done: p.base_price_usd != null },
    { label: "Location", done: !!p.location_city },
    { label: "Languages", done: (p.languages?.length ?? 0) > 0 },
  ];
}

const BAR_COLORS = ["bg-indigo", "bg-sky", "bg-[#7c3aed]", "bg-[#f59e0b]", "bg-[#16a34a]", "bg-[#0891b2]", "bg-[#64748b]"];

const STATUS_PILL: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#92400e]",
  accepted: "bg-[#dcfce7] text-[#166534]",
  completed: "bg-mist text-muted",
  declined: "bg-[#fee2e2] text-[#991b1b]",
  cancelled: "bg-[#fee2e2] text-[#991b1b]",
};

export function ArtistDashboard({ name }: { name: string }) {
  const [profile, setProfile] = useState<ArtistDetail | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookerTypes, setBookerTypes] = useState<BookerTypeBreakdown | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMyArtistProfile(), listMyBookings(), getMyBookerTypes()])
      .then(([p, b, bt]) => {
        if (cancelled) return;
        setProfile(p);
        setBookings(b);
        setBookerTypes(bt);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  const todayKey = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local
  const upcoming = bookings
    .filter((b) => dateKey(b.event_date) >= todayKey && b.status !== "cancelled" && b.status !== "declined")
    .sort((a, b) => dateKey(a.event_date).localeCompare(dateKey(b.event_date)));

  const checks = profile ? completenessChecks(profile) : [];
  const pct = checks.length ? Math.round((checks.filter((c) => c.done).length / checks.length) * 100) : 0;
  const missing = checks.filter((c) => !c.done).map((c) => c.label.toLowerCase());
  const rating = profile?.avg_rating != null ? Number(profile.avg_rating).toFixed(1) : "New";
  const breakdown = bookerTypes?.breakdown ?? [];

  return (
    <div className="max-w-5xl mx-auto p-4 pb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-ink">
            {greeting()}, {name} <span aria-hidden>👋</span>
          </h1>
          <p className="text-xs text-muted">Here&apos;s how your profile is doing.</p>
        </div>
        <Link
          href="/profile/edit"
          className="text-sm font-semibold text-white bg-indigo px-4 py-2 rounded-[10px] whitespace-nowrap"
        >
          Edit profile
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-3">
        {/* Hero — who books you, by type (real) */}
        <div className="bg-white border border-hairline rounded-2xl p-4 sm:col-span-2 lg:col-span-2 lg:row-span-2">
          <h2 className="text-[13px] font-bold text-ink">
            Who books you <span className="text-faint font-normal">· by type</span>
          </h2>
          {breakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 text-muted">
              <i className="ti ti-chart-bar text-2xl mb-2 text-faint" />
              <p className="text-[13px]">No bookings from typed bookers yet.</p>
              <p className="text-[11px] text-faint mt-1">This fills in as venues, event planners and others book you.</p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3.5">
              {breakdown.map((row, i) => (
                <div key={row.type} className="grid grid-cols-[108px_1fr_38px] items-center gap-2.5">
                  <span className="text-[12.5px] font-semibold text-ink truncate">{row.type}</span>
                  <div className="h-2.5 rounded-full bg-mist overflow-hidden">
                    <div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="text-[12.5px] font-bold text-right text-ink">{row.pct}%</span>
                </div>
              ))}
              <p className="text-[11px] text-faint mt-1">
                Top {breakdown.length} · {bookerTypes?.total} booking{bookerTypes?.total === 1 ? "" : "s"} from typed bookers
              </p>
            </div>
          )}
        </div>

        {/* KPIs */}
        <Kpi label="Bookings" value={String(bookings.length)} sub={upcoming.length ? `${upcoming.length} upcoming` : "none upcoming"} />
        <Kpi label="Rating" value={rating} sub={`${profile?.review_count ?? 0} review${(profile?.review_count ?? 0) === 1 ? "" : "s"}`} />
        <Kpi label="Reviews" value={String(profile?.review_count ?? 0)} sub="all-time" />
        <Kpi label="Upcoming" value={String(upcoming.length)} sub="pending + confirmed" />

        {/* Profile completeness */}
        <div className="bg-white border border-hairline rounded-2xl p-4 sm:col-span-2 lg:col-span-2">
          <h2 className="text-[13px] font-bold text-ink mb-2">Profile completeness — {pct}%</h2>
          <div className="h-2 rounded-full bg-mist overflow-hidden">
            <div className="h-full bg-indigo rounded-full" style={{ width: `${pct}%` }} />
          </div>
          {missing.length > 0 ? (
            <p className="text-[12px] text-muted mt-2.5">
              Add {missing.join(", ")} to reach 100% and rank higher in search.{" "}
              <Link href="/profile/edit" className="text-indigo font-semibold">Edit →</Link>
            </p>
          ) : (
            <p className="text-[12px] text-success mt-2.5">Your profile is complete — nice.</p>
          )}
        </div>

        {/* Next up */}
        <div className="bg-white border border-hairline rounded-2xl p-4 sm:col-span-2 lg:col-span-2">
          <h2 className="text-[13px] font-bold text-ink mb-2">Next up</h2>
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-muted py-4">
              No upcoming bookings.{" "}
              <Link href="/search" className="text-indigo font-semibold">Browse bookers →</Link>
            </p>
          ) : (
            <div className="flex flex-col">
              {upcoming.slice(0, 3).map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="flex items-center gap-3 py-2 border-t border-hairline first:border-t-0"
                >
                  <div className="w-9 h-9 rounded-[9px] bg-mist flex items-center justify-center text-indigo flex-none">
                    <i className="ti ti-calendar-event" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink truncate">{b.event_name}</div>
                    <div className="text-[11px] text-muted">
                      {formatDate(b.event_date)}
                      {b.agreed_fee_usd ? ` · $${b.agreed_fee_usd}` : ""}
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 capitalize ${STATUS_PILL[b.status] ?? "bg-mist text-muted"}`}>
                    {b.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white border border-hairline rounded-2xl p-4 flex flex-col justify-center">
      <div className="text-[12px] text-muted font-semibold">{label}</div>
      <div className="text-2xl font-extrabold text-ink mt-1 leading-none">{value}</div>
      <div className="text-[11px] text-faint mt-1">{sub}</div>
    </div>
  );
}
