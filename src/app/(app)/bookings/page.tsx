"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { listMyBookings } from "@/lib/bookings-api";
import { usePublicInfoMap } from "@/lib/use-public-info-map";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { formatDateLong } from "@/lib/calendar";
import type { Booking, BookingStatus } from "@/types/bookings";

// The filter tabs across the top. "all" keeps the grouped view that was
// here before; every other tab renders a flat, date-sorted list.
//
// "Upcoming" maps to `accepted` rather than "any future date" — a pending
// request for next month isn't upcoming, it's still waiting on the
// artist. Completed is included so past played jobs stay reachable;
// without it they'd be filtered out of every tab.
const FILTERS: { key: string; label: string; statuses: BookingStatus[] }[] = [
  { key: "all",       label: "All",       statuses: ["pending", "accepted", "completed", "declined", "cancelled"] },
  { key: "pending",   label: "Pending",   statuses: ["pending"] },
  { key: "upcoming",  label: "Upcoming",  statuses: ["accepted"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
  { key: "declined",  label: "Declined",  statuses: ["declined"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
];

const GROUPS: { label: string; statuses: BookingStatus[] }[] = [
  { label: "Needs your response", statuses: ["pending"] },
  { label: "Upcoming", statuses: ["accepted"] },
  { label: "Past", statuses: ["completed", "declined", "cancelled"] },
];

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const isArtist = user?.role === "artist";
  const otherIds = (bookings ?? []).map((b) => (isArtist ? b.planner_id : b.artist_id));
  const directory = usePublicInfoMap(otherIds);

  useEffect(() => {
    let cancelled = false;
    listMyBookings()
      .then((data) => {
        if (!cancelled) setBookings(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your bookings.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;
  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!bookings) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center text-center px-8 py-16">
        <div className="w-14 h-14 rounded-full bg-sand flex items-center justify-center text-xl text-faint mb-4">
          <i className="ti ti-calendar-event" />
        </div>
        <p className="text-[15px] font-bold text-ink mb-1.5">No bookings yet</p>
        <p className="text-[13px] text-muted leading-relaxed max-w-[260px]">
          {isArtist
            ? "Booking requests from planners will show up here."
            : "Propose a booking from a conversation with an artist to get started."}
        </p>
      </div>
    );
  }

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const visible = bookings.filter((b) => active.statuses.includes(b.status));

  function renderCard(b: Booking) {
    const otherId = isArtist ? b.planner_id : b.artist_id;
    const other = directory[otherId];
    return (
      <button
        key={b.id}
        onClick={() => router.push(`/bookings/${b.id}`)}
        className="w-full text-left border border-hairline rounded-xl p-3.5"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-ink">{b.event_name}</span>
          <StatusBadge status={b.status} />
        </div>
        <p className="text-xs text-muted">
          {formatDateLong(b.event_date)}
          {other?.displayName && ` · ${other.displayName}`}
          {!other?.displayName && ` · ${isArtist ? "A planner" : "An artist"}`}
        </p>
        {b.agreed_fee_usd != null && (
          <p className="text-xs text-faint mt-0.5">
            ${Number(b.agreed_fee_usd).toLocaleString()}
          </p>
        )}
      </button>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      <h1 className="text-lg font-bold text-ink px-4 pt-4 pb-1">Bookings</h1>

      {/* Six equal columns rather than a scrolling row: every tab is
          visible at once, at any width. The count sits under the label
          instead of beside it, which is what buys the horizontal room to
          fit "Completed" and "Cancelled" on a phone. */}
      <div className="grid grid-cols-6 gap-0.5 px-2 py-3 sm:gap-1 sm:px-4">
        {FILTERS.map((f) => {
          const count = bookings.filter((b) => f.statuses.includes(b.status)).length;
          const selected = f.key === filter;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={selected}
              title={f.label}
              className={`min-w-0 flex flex-col items-center gap-0.5 py-1.5 rounded-xl border ${
                selected
                  ? "bg-ink text-white border-ink"
                  : "bg-surface text-muted border-hairline hover:bg-sand"
              }`}
            >
              {/* 9px below 360px keeps "Completed" from truncating on the
                  narrowest phones still in use (iPhone SE 1st gen). */}
              <span className="w-full truncate text-center text-[10px] leading-tight font-semibold tracking-tight max-[359px]:text-[9px] sm:text-[11px] sm:tracking-normal">
                {f.label}
              </span>
              <span
                className={`text-[11px] font-bold leading-none ${
                  selected ? "text-white" : "text-ink"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="px-4 py-10 text-center text-[13px] text-muted">
          No {active.label.toLowerCase()} bookings.
        </p>
      ) : filter === "all" ? (
        GROUPS.map((group) => {
          const items = bookings.filter((b) => group.statuses.includes(b.status));
          if (items.length === 0) return null;
          return (
            <div key={group.label} className="mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-faint px-4 pt-4 pb-2">
                {group.label}
              </p>
              <div className="flex flex-col gap-2 px-4">{items.map(renderCard)}</div>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col gap-2 px-4">{visible.map(renderCard)}</div>
      )}
    </div>
  );
}
