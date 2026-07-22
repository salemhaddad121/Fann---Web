"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getArtist } from "@/lib/artists-api";
import { getArtistReviews } from "@/lib/reviews-api";
import { startConversation } from "@/lib/messaging-api";
import { listSavedArtistIds, saveArtist, unsaveArtist } from "@/lib/saved-api";
import { AppShell } from "@/components/shell/AppShell";
import { PageBackground } from "@/components/shell/PageBackground";
import { PublicHeader } from "@/components/search/PublicHeader";
import { ArtistProfileView } from "@/components/profile/ArtistProfileView";
import type { ArtistDetail } from "@/types/artists";
import type { Review } from "@/types/reviews";
import { ApiError } from "@/lib/api";

function MessageCta({ artist }: { artist: ArtistDetail }) {
  const { user } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only planners can start a conversation with an artist — the backend
  // 403s anyone else (see messaging.service.ts createConversation()).
  // Anonymous visitors get a login prompt; artists/admins get nothing,
  // since there's no valid messaging action for them here.
  if (!user) {
    return (
      <div className="sticky bottom-0 bg-white border-t border-hairline p-3 max-w-lg mx-auto">
        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] border-[1.5px] border-ink text-sm font-semibold text-ink"
        >
          Log in to message {artist.display_name}
        </Link>
      </div>
    );
  }

  if (user.role !== "planner") return null;

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
    <div className="sticky bottom-0 bg-white border-t border-hairline p-3 max-w-lg mx-auto">
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getArtist(id)
      .then(async (data) => {
        if (cancelled) return;
        setArtist(data);
        // Reviews are keyed by the artist's user id, not the profile id in `id`.
        const r = await getArtistReviews(data.user_id).catch(() => []);
        if (!cancelled) setReviews(r);
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

  if (loading) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  if (error || !artist) {
    return (
      <div className="px-4 py-10">
        <p className="text-sm text-danger mb-3">{error ?? "Artist not found."}</p>
        <Link href="/search" className="text-sm font-semibold text-indigo">
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

      <ArtistProfileView
        artist={artist}
        reviews={reviews}
        isOwnProfile={isOwnProfile}
        accountStatus={isOwnProfile ? user?.status : undefined}
      />

      {isOwnProfile ? (
        <div className="sticky bottom-0 bg-white border-t border-hairline p-3 max-w-lg mx-auto">
          <Link
            href="/profile/edit"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] bg-indigo text-white text-sm font-semibold"
          >
            <i className="ti ti-pencil text-sm" /> Edit profile
          </Link>
        </div>
      ) : (
        <MessageCta artist={artist} />
      )}
    </div>
  );
}

export default function ArtistDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return (
      <AppShell user={user} background="artist">
        <Content id={params.id} />
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen relative">
      <PageBackground role="artist" />
      <div className="relative z-10">
        <PublicHeader />
        <Content id={params.id} />
      </div>
    </div>
  );
}
