"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { listMyBookings } from "@/lib/bookings-api";
import { usePublicInfoMap } from "@/lib/use-public-info-map";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { formatDateLong } from "@/lib/calendar";
import type { Booking } from "@/types/bookings";

const GROUPS: { label: string; statuses: Booking["status"][] }[] = [
  { label: "Needs your response", statuses: ["pending"] },
  { label: "Upcoming", statuses: ["accepted"] },
  { label: "Past", statuses: ["completed", "declined", "cancelled"] },
];

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        <div className="w-14 h-14 rounded-full bg-mist flex items-center justify-center text-xl text-faint mb-4">
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

  return (
    <div className="max-w-lg mx-auto pb-8">
      <h1 className="text-lg font-bold text-ink px-4 pt-4 pb-1">Bookings</h1>

      {GROUPS.map((group) => {
        const items = bookings.filter((b) => group.statuses.includes(b.status));
        if (items.length === 0) return null;
        return (
          <div key={group.label} className="mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-faint px-4 pt-4 pb-2">
              {group.label}
            </p>
            <div className="flex flex-col gap-2 px-4">
              {items.map((b) => {
                const otherId = isArtist ? b.planner_id : b.artist_id;
                const other = directory[otherId];
                return (
                  <button
                    key={b.id}
                    onClick={() => router.push(`/bookings/${b.id}`)}
                    className="text-left border border-hairline rounded-xl p-3.5"
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
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
