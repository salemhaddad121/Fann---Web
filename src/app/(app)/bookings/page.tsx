"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { listMyBookings } from "@/lib/bookings-api";
import { usePublicInfoMap } from "@/lib/use-public-info-map";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { MascotDoodle } from "@/components/brand/MascotDoodle";
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
            ? "Booking requests from planners will show up here. A complete profile is what gets you found."
            : "Propose a booking from a conversation with an artist to get started."}
        </p>
        {/* Each side gets the control that fills this screen. A planner
            needs an artist, so the route in is search; an artist cannot
            create a booking at all — only receive one — so theirs goes to
            the profile that decides whether they get found. */}
        <Link href={isArtist ? "/profile" : "/search"} className="mt-5 inline-flex h-11 items-center rounded-[10px] bg-clay-deep px-4 text-sm font-semibold text-white">
          {isArtist ? "Check your profile" : "Find an artist"}
        </Link>
      </div>
    );
  }

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const visible = bookings.filter((b) => active.statuses.includes(b.status));

  /*
   * Which card the doodle hangs off.
   *
   * One per page, so it is the first card actually RENDERED — which in the
   * grouped view is the first card of the first non-empty group, not
   * visible[0]. Resolved here rather than with a flag flipped inside
   * renderCard, so the answer does not depend on render order.
   */
  const firstRendered =
    filter === "all"
      ? GROUPS.flatMap((g) => bookings.filter((b) => g.statuses.includes(b.status)))[0]
      : visible[0];

  function renderCard(b: Booking) {
    const otherId = isArtist ? b.planner_id : b.artist_id;
    const other = directory[otherId];
    return (
      <button
        key={b.id}
        onClick={() => router.push(`/bookings/${b.id}`)}
        className="relative w-full text-left border border-hairline rounded-xl p-3.5"
      >
        {/* Peeking round the outer edge of the first card, into the page
            gutter — mint, and empty.

            34px wide, not the plan's ~58. This pose is 101x325, so width is
            what sets height: 58 gives a 187px dog against a 95px card and it
            dangles past the card into nothing, which is the floating look
            hard rule 2 forbids. 34 gives 109px, so it stands 15px proud of
            the bottom edge and reads as leaning round it.

            It cannot reach the status badge. The badge sits inside the
            card's 14px right padding and the doodle starts 3px OUTSIDE that
            content edge, measured identical at 1024, 1280 and 1440 — so no
            length of badge label can close the gap.

            hideBelow lg because there is no gutter on a phone: the column is
            the viewport, and a doodle at left:100% there is sideways scroll.
            Confirmed hidden and no overflow at 360/390/768/1023. */}
        {b.id === firstRendered?.id && (
          <MascotDoodle variant="peek" offset="0px" width={34} hideBelow="lg" />
        )}
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
    <div className="max-w-lg lg:max-w-3xl mx-auto pb-8">
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
              {/* The one documented exception to item 31's 12px floor.
                  Five equal tabs have to fit 320px on the narrowest phones
                  still in use (iPhone SE 1st gen), and "Completed" does not
                  at 12px. Raised as far as it will go — 9px to 11px — rather
                  than left where it was; truncate plus the title attribute
                  already handle the overflow case gracefully. Above 360px
                  the floor applies normally. */}
              <span className="w-full truncate text-center text-[12px] leading-tight font-semibold tracking-tight max-[359px]:text-[11px] sm:tracking-normal">
                {f.label}
              </span>
              <span
                className={`text-[12px] font-bold leading-none ${
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
              <p className="text-[12px] font-semibold uppercase tracking-wide text-faint px-4 pt-4 pb-2">
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
