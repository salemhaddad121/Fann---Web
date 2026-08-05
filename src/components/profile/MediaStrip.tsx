import type { MediaItem } from "@/types/artists";

export function MediaStrip({
  media,
  onSelect,
}: {
  media: MediaItem[];
  // Reports the index within `media` so the caller can open its viewer at
  // the right item. Omitted where there's nothing to open into, in which
  // case the tiles stay inert rather than looking clickable.
  onSelect?: (index: number) => void;
}) {
  if (media.length === 0) {
    return <p className="text-sm text-faint">No photos or videos uploaded yet.</p>;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      {media.map((m, i) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect?.(i)}
          disabled={!onSelect}
          aria-label={m.media_type === "video" ? "Play video" : "View photo"}
          className="relative shrink-0 w-28 h-28 rounded-xl overflow-hidden border border-hairline bg-sand"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- external CDN URLs */}
          <img src={m.cdn_url} alt="" className="w-full h-full object-cover" />
          {m.media_type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <i className="ti ti-player-play-filled text-white text-xl" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
