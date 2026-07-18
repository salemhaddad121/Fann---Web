import Link from "next/link";
import { badgeColor } from "@/lib/badge-colors";
import type { ArtistCard as ArtistCardType } from "@/types/artists";

function formatPrice(value: ArtistCardType["base_price_usd"]) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!n || Number.isNaN(n)) return null;
  return `From $${n.toLocaleString()}`;
}

export function ArtistCard({
  artist,
  isSaved,
  onToggleSave,
}: {
  artist: ArtistCardType;
  isSaved?: boolean;
  onToggleSave?: () => void;
}) {
  const primaryCategory = artist.categories[0];
  const price = formatPrice(artist.base_price_usd);
  const showSaveButton = onToggleSave !== undefined;

  return (
    <Link
      href={`/artists/${artist.id}`}
      className="bg-white border border-hairline rounded-[14px] overflow-hidden flex flex-col"
    >
      <div className="relative w-full pt-[64%] bg-mist">
        {artist.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- external CDN URLs, no next.config domain list set up yet
          <img
            src={artist.thumbnail_url}
            alt={artist.display_name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-faint">
            <i className="ti ti-user text-2xl" />
          </div>
        )}
        {primaryCategory && (
          <span
            className={`absolute bottom-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-lg ${badgeColor(primaryCategory.slug)}`}
          >
            {primaryCategory.name}
          </span>
        )}
        {showSaveButton && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleSave?.();
            }}
            aria-label={isSaved ? "Remove from saved" : "Save"}
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
          >
            <i className={`ti ${isSaved ? "ti-heart-filled text-danger" : "ti-heart text-muted"} text-sm`} />
          </button>
        )}
      </div>

      <div className="flex-1 px-2.5 py-2 flex flex-col gap-0.5">
        <div className="text-xs font-semibold text-ink truncate">{artist.display_name}</div>
        {artist.location_city && (
          <div className="text-[10px] text-muted flex items-center gap-1">
            <i className="ti ti-map-pin text-[10px]" />
            {artist.location_city}
          </div>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-faint truncate">{price ?? "Price on request"}</span>
          {artist.is_verified && (
            <span className="text-[10px] text-success flex items-center gap-0.5 shrink-0">
              <i className="ti ti-rosette-discount-check text-xs" /> Verified
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
