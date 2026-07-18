"use client";

import { useRef, useState } from "react";
import {
  ACCEPTED_MIME_TYPES,
  MAX_PHOTO_BYTES,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
  mediaTypeFromMime,
  getVideoDurationSeconds,
  uploadMedia,
  setPrimaryMedia,
  deleteMedia,
} from "@/lib/media-api";
import type { MediaItem } from "@/types/artists";

const MAX_ITEMS = 20;

function formatMb(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)}MB`;
}

export function MediaManager({
  media,
  onChange,
}: {
  media: MediaItem[];
  onChange: (next: MediaItem[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setError(null);

    if (media.length >= MAX_ITEMS) {
      setError(`You can have up to ${MAX_ITEMS} media items — remove one first.`);
      return;
    }

    const mediaType = mediaTypeFromMime(file.type);
    if (!mediaType) {
      setError("Unsupported file type. Use JPG, PNG, WEBP, MP4, or MOV.");
      return;
    }

    if (mediaType === "photo" && file.size > MAX_PHOTO_BYTES) {
      setError(`Photos must be ${formatMb(MAX_PHOTO_BYTES)} or smaller.`);
      return;
    }
    if (mediaType === "video" && file.size > MAX_VIDEO_BYTES) {
      setError(`Videos must be ${formatMb(MAX_VIDEO_BYTES)} or smaller.`);
      return;
    }

    let durationSec: number | undefined;
    if (mediaType === "video") {
      try {
        durationSec = await getVideoDurationSeconds(file);
      } catch {
        setError("Couldn't read that video file. Try a different one.");
        return;
      }
      if (durationSec > MAX_VIDEO_SECONDS) {
        setError(`Videos must be ${MAX_VIDEO_SECONDS} seconds or shorter (this one is ${durationSec}s).`);
        return;
      }
    }

    setUploading(true);
    try {
      const item = await uploadMedia(file, mediaType, durationSec);
      // A first uploaded photo is auto-marked primary by the backend —
      // reflect that locally too instead of waiting on a refetch.
      const next = item.is_primary
        ? [item, ...media.map((m) => ({ ...m, is_primary: false }))]
        : [...media, item];
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
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
          <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden border border-hairline bg-mist group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.cdn_url} alt="" className="w-full h-full object-cover" />
            {m.media_type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <i className="ti ti-player-play-filled text-white text-xl" />
              </div>
            )}
            {m.is_primary && (
              <span className="absolute top-1 left-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo text-white">
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
                  className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-ink disabled:opacity-50"
                >
                  <i className="ti ti-star text-xs" />
                </button>
              )}
              <button
                type="button"
                disabled={busyId === m.id}
                onClick={() => handleDelete(m.id)}
                title="Delete"
                className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-danger disabled:opacity-50"
              >
                <i className="ti ti-trash text-xs" />
              </button>
            </div>
          </div>
        ))}

        {media.length < MAX_ITEMS && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border border-dashed border-hairline flex flex-col items-center justify-center gap-1 text-faint disabled:opacity-50"
          >
            {uploading ? (
              <span className="h-4 w-4 rounded-full border-2 border-hairline border-t-indigo animate-spin" />
            ) : (
              <>
                <i className="ti ti-plus text-lg" />
                <span className="text-[10px]">Add</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES}
        onChange={handleFileSelected}
        className="hidden"
      />
      <p className="text-[11px] text-faint mt-1.5">
        JPG/PNG/WEBP up to 10MB, or MP4/MOV up to 250MB and 60 seconds.
      </p>
    </div>
  );
}
