"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { UnlockCta } from "@/components/profile/LockedField";
import { GuestChrome } from "@/components/shell/GuestChrome";
import { getArtist } from "@/lib/artists-api";
import { startConversation } from "@/lib/messaging-api";
import { createBooking } from "@/lib/bookings-api";
import { listSavedArtistIds, saveArtist, unsaveArtist } from "@/lib/saved-api";
import { AppShell } from "@/components/shell/AppShell";
import { ArtistProfileView } from "@/components/profile/ArtistProfileView";
import { ProposeBookingForm } from "@/components/bookings/ProposeBookingForm";
import { formatDateLong } from "@/lib/calendar";
import type { ArtistDetail } from "@/types/artists";
import { ApiError } from "@/lib/api";

function MessageCta({ artist }: { artist: ArtistDetail }) {
  const { user } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only planners can start a conversation with an artist — the backend
  // 403s anyone else (see messaging.service.ts createConversation()).
  // Artists and admins get nothing, since there's no valid messaging action
  // for them here. There is no anonymous case any more: this page requires
  // a session, so the old "log in to message" prompt was unreachable.
  if (user?.role !== "planner") return null;

  async function handleMessage() {
    setError(null);
    setSending(true);
    try {
      const conversation = await startConversation(artist.user_id);
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start the conversation.");
      setSending(false);
    }
  }

  return (
    <div className="sticky bottom-0 bg-surface border-t border-hairline p-3 max-w-lg mx-auto">
      {error && <p className="text-xs text-danger mb-2">{error}</p>}
      <button
        onClick={handleMessage}
        disabled={sending}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] border-[1.5px] border-ink text-sm font-semibold text-ink disabled:opacity-60"
      >
        <i className="ti ti-message-circle text-sm" /> {sending ? "Starting…" : "Message"}
      </button>
    </div>
  );
}

function Content({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  // Booking request started from a calendar day.
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getArtist(id)
      .then((data) => {
        if (!cancelled) setArtist(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Couldn't load this profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (user?.role !== "planner") return;
    let cancelled = false;
    listSavedArtistIds()
      .then((ids) => {
        if (!cancelled) setIsSaved(ids.includes(id));
      })
      .catch(() => {
        // Non-critical — the heart just defaults to outline.
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.role]);

  async function toggleSave() {
    const next = !isSaved;
    setIsSaved(next);
    try {
      if (next) await saveArtist(id);
      else await unsaveArtist(id);
    } catch {
      setIsSaved(!next);
    }
  }

  async function handleProposeBooking(payload: {
    eventName: string;
    eventDate: string;
    eventLocation?: string;
    durationHours?: number;
    agreedFeeUsd?: number;
    notes?: string;
  }) {
    const booking = await createBooking({ artistId: artist!.user_id, ...payload });
    setPickedDate(null);
    setBookingNotice(
      `Request sent for ${formatDateLong(booking.event_date)} — waiting on ${artist!.display_name} to confirm.`,
    );
    // Pull the profile again so the new pending booking is reflected in
    // the availability the calendar draws from.
    getArtist(id)
      .then(setArtist)
      .catch(() => {
        // Non-critical: the request already went through.
      });
  }

  if (loading) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  if (error || !artist) {
    return (
      <div className="px-4 py-10">
        <p className="text-sm text-danger mb-3">{error ?? "Artist not found."}</p>
        <Link href="/search" className="text-sm font-semibold text-clay">
          ← Back to search
        </Link>
      </div>
    );
  }

  const isOwnProfile = user?.id === artist.user_id;

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-muted">
          <i className="ti ti-arrow-left" /> Back
        </button>
        {user?.role === "planner" && !isOwnProfile && (
          <button
            onClick={toggleSave}
            aria-label={isSaved ? "Remove from saved" : "Save"}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted"
          >
            <i className={`ti ${isSaved ? "ti-heart-filled text-danger" : "ti-heart"}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
        )}
      </div>

      {bookingNotice && (
        <div className="mx-4 mt-3 px-3.5 py-2.5 rounded-[10px] bg-success-bg border border-[#86EFAC] text-success text-xs">
          {bookingNotice}
        </div>
      )}

      <ArtistProfileView
        artist={artist}
        isOwnProfile={isOwnProfile}
        accountStatus={isOwnProfile ? user?.status : undefined}
        onPickDate={
          user?.role === "planner" && !isOwnProfile
            ? (dateKey) => {
                setBookingNotice(null);
                setPickedDate(dateKey);
              }
            : undefined
        }
      />

      {pickedDate && (
        <div className="fixed inset-0 z-[70] bg-ink/40 flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-lg sm:rounded-2xl bg-surface overflow-hidden max-h-[90vh] flex flex-col">
            <ProposeBookingForm
              initialDate={pickedDate}
              containerClassName="flex flex-col min-h-0"
              onCancel={() => setPickedDate(null)}
              onSubmit={handleProposeBooking}
            />
          </div>
        </div>
      )}

      {isOwnProfile ? (
        <div className="sticky bottom-0 bg-surface border-t border-hairline p-3 max-w-lg mx-auto">
          <Link
            href="/profile/edit"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] bg-clay-deep text-white text-sm font-semibold"
          >
            <i className="ti ti-pencil text-sm" /> Edit profile
          </Link>
        </div>
      ) : artist.viewer_tier === "subscribed" ? (
        // Admins and artists viewing someone else fall through to null
        // inside MessageCta — there is no messaging action for them here.
        <MessageCta artist={artist} />
      ) : (
        <UnlockCta tier={artist.viewer_tier} />
      )}
    </div>
  );
}

export default function ArtistDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  // Wait for the session probe before deciding which chrome to render,
  // otherwise a signed-in user briefly sees the guest header.
  if (isLoading) return null;

  if (!user) {
    return (
      <GuestChrome>
        <Content id={params.id} />
      </GuestChrome>
    );
  }

  return (
    <AppShell user={user} background="artist">
      <Content id={params.id} />
    </AppShell>
  );
}
