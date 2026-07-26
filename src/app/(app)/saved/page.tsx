"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { listSavedArtists, unsaveArtist } from "@/lib/saved-api";
import { ArtistCard } from "@/components/search/ArtistCard";
import { ComingSoon } from "@/components/shell/ComingSoon";
import type { ArtistCard as ArtistCardType } from "@/types/artists";

function SavedList() {
  const [artists, setArtists] = useState<ArtistCardType[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSavedArtists()
      .then((data) => {
        if (!cancelled) setArtists(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your saved artists.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemove(artistId: string) {
    setArtists((prev) => (prev ? prev.filter((a) => a.id !== artistId) : prev));
    try {
      await unsaveArtist(artistId);
    } catch {
      // If the delete failed, a refresh will bring it back — acceptable
      // for a low-stakes action like unsaving.
    }
  }

  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!artists) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center text-center px-8 py-16">
        <div className="w-14 h-14 rounded-full bg-mist flex items-center justify-center text-xl text-faint mb-4">
          <i className="ti ti-heart" />
        </div>
        <p className="text-[15px] font-bold text-ink mb-1.5">Nothing saved yet</p>
        <p className="text-[13px] text-muted leading-relaxed max-w-[260px]">
          Tap the heart on an artist&apos;s card or profile while browsing to save them here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-ink px-4 pt-4 pb-2">Saved</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 px-4 pb-6">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} isSaved onToggleSave={() => handleRemove(artist.id)} />
        ))}
      </div>
    </div>
  );
}

export default function SavedPage() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return null;

  if (user.role !== "planner") {
    return (
      <ComingSoon
        title="Saved"
        blurb="Saving artists is a planner feature — nothing to show for an artist account."
      />
    );
  }

  return <SavedList />;
}
