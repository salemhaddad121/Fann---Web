"use client";

import { useEffect } from "react";
import type { MediaItem } from "@/types/artists";

// Full-screen viewer for a profile's photos and videos.
//
// The media box is 70vw x 70vh — the requested "70% of the screen from the
// centre" — with object-contain inside it, so a portrait photo and a
// landscape one both fill as much of that box as their aspect ratio allows
// without being cropped or stretched.
//
// Videos get a real <video> element. The thumbnails render them through
// <img>, which cannot display an mp4 at all; that's tolerable for a tile
// with a play badge over it, but not for the enlarged view.
export function MediaLightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: MediaItem[];
  index: number | null;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const open = index !== null && index >= 0 && index < items.length;

  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && items.length > 1) {
        onIndexChange(((index as number) + 1) % items.length);
      }
      if (e.key === "ArrowLeft" && items.length > 1) {
        onIndexChange(((index as number) - 1 + items.length) % items.length);
      }
    }

    // Stop the page behind the overlay scrolling with the wheel/trackpad.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, index, items.length, onIndexChange, onClose]);

  if (!open) return null;
  const item = items[index as number];
  const many = items.length > 1;

  function step(delta: number) {
    onIndexChange(((index as number) + delta + items.length) % items.length);
  }

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/15 text-white flex items-center justify-center hover:bg-surface/25"
      >
        <i className="ti ti-x text-xl" />
      </button>

      {many && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous"
            className="absolute left-3 sm:left-6 w-10 h-10 rounded-full bg-surface/15 text-white flex items-center justify-center hover:bg-surface/25"
          >
            <i className="ti ti-chevron-left text-xl" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next"
            className="absolute right-3 sm:right-6 w-10 h-10 rounded-full bg-surface/15 text-white flex items-center justify-center hover:bg-surface/25"
          >
            <i className="ti ti-chevron-right text-xl" />
          </button>
        </>
      )}

      {/* Clicks inside the media itself shouldn't dismiss — only the
          backdrop does. */}
      <div
        className="w-[70vw] h-[70vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.media_type === "video" ? (
          <video
            key={item.id}
            src={item.cdn_url}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-full rounded-lg bg-black"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- external CDN URLs
          <img
            key={item.id}
            src={item.cdn_url}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        )}
      </div>

      {many && (
        <div className="absolute bottom-5 text-white/70 text-xs font-semibold">
          {(index as number) + 1} / {items.length}
        </div>
      )}
    </div>
  );
}
