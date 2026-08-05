"use client";

import { useState } from "react";
import {
  MAX_VIDEO_SECONDS,
  MIN_PHOTO_SHORT_SIDE,
  MIN_VIDEO_SHORT_SIDE,
  setPrimaryMedia,
  deleteMedia,
} from "@/lib/media-api";
import { UppyMediaUploader } from "@/components/profile/UppyMediaUploader";
import type { MediaItem } from "@/types/artists";

const MAX_ITEMS = 20;

// Owns the gallery — listing, choosing the primary photo, deleting. Adding
// files is delegated to UppyMediaUploader, which handles selection, cropping
// and the presign/PUT/confirm round trip.
export function MediaManager({
  media,
  onChange,
}: {
  media: MediaItem[];
  onChange: (next: MediaItem[]) => void;
}) {
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleUploaded(items: MediaItem[]) {
    // The backend marks the first photo on a profile as primary. Reflect
    // whatever it decided rather than guessing, so the badge doesn't lie
    // until the next refetch.
    const next = [...media, ...items];
    const promoted = items.find((i) => i.is_primary);
    onChange(promoted ? next.map((m) => ({ ...m, is_primary: m.id === promoted.id })) : next);
  }

  async function handleSetPrimary(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await setPrimaryMedia(id);
      onChange(media.map((m) => ({ ...m, is_primary: m.id === id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't set that as your primary photo.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await deleteMedia(id);
      const wasPrimary = media.find((m) => m.id === id)?.is_primary;
      const remaining = media.filter((m) => m.id !== id);
      // Mirror the backend's auto-promote-next-photo behavior locally.
      if (wasPrimary) {
        const nextPhotoIndex = remaining.findIndex((m) => m.media_type === "photo");
        if (nextPhotoIndex >= 0) remaining[nextPhotoIndex] = { ...remaining[nextPhotoIndex], is_primary: true };
      }
      onChange(remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that item.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-ink">Photos &amp; videos</span>
        <span className="text-[11px] text-faint">{media.length}/{MAX_ITEMS}</span>
      </div>

      {error && <p className="text-xs text-danger mb-2">{error}</p>}

      <div className="grid grid-cols-3 gap-2">
        {media.map((m) => (
          <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden border border-hairline bg-sand group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.cdn_url} alt="" className="w-full h-full object-cover" />
            {m.media_type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <i className="ti ti-player-play-filled text-white text-xl" />
              </div>
            )}
            {m.is_primary && (
              <span className="absolute top-1 left-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-clay-deep text-white">
                Primary
              </span>
            )}
            <div className="absolute top-1 right-1 flex gap-1">
              {m.media_type === "photo" && !m.is_primary && (
                <button
                  type="button"
                  disabled={busyId === m.id}
                  onClick={() => handleSetPrimary(m.id)}
                  title="Set as primary photo"
                  className="w-6 h-6 rounded-full bg-surface/90 flex items-center justify-center text-ink disabled:opacity-50"
                >
                  <i className="ti ti-star text-xs" />
                </button>
              )}
              <button
                type="button"
                disabled={busyId === m.id}
                onClick={() => handleDelete(m.id)}
                title="Delete"
                className="w-6 h-6 rounded-full bg-surface/90 flex items-center justify-center text-danger disabled:opacity-50"
              >
                <i className="ti ti-trash text-xs" />
              </button>
            </div>
          </div>
        ))}

        {media.length < MAX_ITEMS && (
          <button
            type="button"
            onClick={() => setUploaderOpen(true)}
            className="aspect-square rounded-xl border border-dashed border-hairline flex flex-col items-center justify-center gap-1 text-faint"
          >
            <i className="ti ti-plus text-lg" />
            <span className="text-[10px]">Add</span>
          </button>
        )}
      </div>

      {uploaderOpen && (
        <UppyMediaUploader
          remainingSlots={MAX_ITEMS - media.length}
          onUploaded={handleUploaded}
          onClose={() => setUploaderOpen(false)}
        />
      )}

      <p className="text-[11px] text-faint mt-1.5">
        JPG/PNG/WEBP up to 10MB, at least {MIN_PHOTO_SHORT_SIDE}px on the short side. MP4/MOV up to
        250MB and {MAX_VIDEO_SECONDS} seconds, at least {MIN_VIDEO_SHORT_SIDE}p.
      </p>
    </div>
  );
}
