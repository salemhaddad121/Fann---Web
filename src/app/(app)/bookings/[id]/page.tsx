"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getBooking, respondToBooking, cancelBooking } from "@/lib/bookings-api";
import { usePublicInfoMap } from "@/lib/use-public-info-map";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { Button } from "@/components/auth/Button";
import { formatDateLong } from "@/lib/calendar";
import type { Booking } from "@/types/bookings";

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <i className={`ti ${icon} text-faint text-base mt-0.5`} />
      <div>
        <div className="text-[11px] text-faint">{label}</div>
        <div className="text-sm text-ink font-medium">{value}</div>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelNote, setCancelNote] = useState("");

  const otherId =
    booking && user ? (user.role === "artist" ? booking.planner_id : booking.artist_id) : null;
  const directory = usePublicInfoMap(otherId ? [otherId] : []);

  useEffect(() => {
    let cancelled = false;
    getBooking(params.id)
      .then((data) => {
        if (!cancelled) setBooking(data);
      })
      .catch(() => {
        if (!cancelled) setError("This booking isn't available.");
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (!user) return null;
  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!booking) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  const isArtist = user.role === "artist";
  const other = otherId ? directory[otherId] : undefined;
  const profileHref = other?.profileId
    ? isArtist
      ? `/planners/${other.profileId}`
      : `/artists/${other.profileId}`
    : null;

  async function handleRespond(decision: "accepted" | "declined") {
    setActionError(null);
    setBusy(true);
    try {
      const updated = await respondToBooking(booking!.id, decision);
      setBooking(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't update the booking.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setActionError(null);
    setBusy(true);
    try {
      const updated = await cancelBooking(booking!.id, cancelNote.trim() || undefined);
      setBooking(updated);
      setCancelling(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't cancel the booking.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline">
        <button onClick={() => router.push("/bookings")} className="text-muted">
          <i className="ti ti-arrow-left text-lg" />
        </button>
        <span className="text-sm font-semibold text-ink">Booking details</span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h1 className="text-lg font-bold text-ink">{booking.event_name}</h1>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-muted mb-4">
          With{" "}
          {profileHref ? (
            <Link href={profileHref} className="font-semibold text-clay hover:underline">
              {other?.displayName ?? (isArtist ? "a planner" : "an artist")}
            </Link>
          ) : (
            other?.displayName ?? (isArtist ? "a planner" : "an artist")
          )}
        </p>

        <div className="border border-hairline rounded-xl px-3.5 divide-y divide-hairline mb-4">
          <Row icon="ti-calendar-event" label="Date" value={formatDateLong(booking.event_date)} />
          {booking.event_location && <Row icon="ti-map-pin" label="Location" value={booking.event_location} />}
          {booking.duration_hours != null && (
            <Row icon="ti-clock" label="Duration" value={`${booking.duration_hours} hours`} />
          )}
          {booking.agreed_fee_usd != null && (
            <Row icon="ti-currency-dollar" label="Agreed fee" value={`$${Number(booking.agreed_fee_usd).toLocaleString()}`} />
          )}
        </div>

        {booking.notes && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-ink mb-1">Notes</p>
            <p className="text-sm text-muted leading-relaxed">{booking.notes}</p>
          </div>
        )}

        {booking.status === "cancelled" && booking.cancellation_note && (
          <div className="mb-4 bg-sand border border-hairline rounded-xl p-3">
            <p className="text-xs font-semibold text-ink mb-1">Cancellation note</p>
            <p className="text-sm text-muted">{booking.cancellation_note}</p>
          </div>
        )}

        {actionError && <p className="text-sm text-danger mb-3">{actionError}</p>}

        {/* Artist: accept/decline a pending request */}
        {isArtist && booking.status === "pending" && (
          <div className="flex gap-2 mb-3">
            <Button variant="ghost" disabled={busy} onClick={() => handleRespond("declined")} className="flex-1">
              Decline
            </Button>
            <Button disabled={busy} onClick={() => handleRespond("accepted")} className="flex-1">
              Accept
            </Button>
          </div>
        )}

        {/* Either party: cancel a pending or accepted booking */}
        {(booking.status === "pending" || booking.status === "accepted") && (
          <>
            {!cancelling ? (
              <button
                onClick={() => setCancelling(true)}
                className="text-sm font-semibold text-danger mb-3"
              >
                Cancel this booking
              </button>
            ) : (
              <div className="border border-hairline rounded-xl p-3.5 mb-3">
                <label className="block mb-3">
                  <span className="block text-xs font-semibold text-ink mb-1.5">
                    Reason (optional)
                  </span>
                  <textarea
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-clay"
                  />
                </label>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setCancelling(false)} className="flex-1">
                    Never mind
                  </Button>
                  <Button loading={busy} onClick={handleCancel} className="flex-1">
                    Confirm cancellation
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
