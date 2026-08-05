import Link from "next/link";
import { badgeColor } from "@/lib/badge-colors";
import type { ArtistCard as ArtistCardType } from "@/types/artists";

function formatPrice(value: ArtistCardType["base_price_usd"]) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!n || Number.isNaN(n)) return null;
  return `From $${n.toLocaleString()}`;
}

// Fades the photo out into the brand ink so white text stays legible over any
// image. Kept as an inline style — same approach as PageBackground/AuthShell.
const NAME_BANNER_GRADIENT = "linear-gradient(rgba(11,29,81,0), rgba(11,29,81,0.92))";

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
  const subtitle = [artist.location_city, price ?? "Price on request"]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/artists/${artist.id}`}
      className="bg-surface border border-hairline rounded-[14px] overflow-hidden flex flex-col"
    >
      {/* Portrait 5:6-ish frame. The name banner below is a fixed ~93px tall,
          so on the old 64% (landscape) frame it swallowed 89% of the photo. */}
      <div className="relative w-full pt-[120%] bg-sand">
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
            className={`absolute top-1.5 left-1.5 z-10 text-[10px] font-semibold px-2 py-0.5 rounded-lg ${badgeColor(primaryCategory.slug)}`}
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
            className="absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-full bg-surface/90 flex items-center justify-center"
          >
            <i className={`ti ${isSaved ? "ti-heart-filled text-danger" : "ti-heart text-muted"} text-sm`} />
          </button>
        )}

        <div
          className="absolute inset-x-0 bottom-0 px-[13px] pb-[11px] pt-[46px] text-white"
          style={{ backgroundImage: NAME_BANNER_GRADIENT }}
        >
          <div className="flex items-center gap-1">
            <span className="font-bold text-[15px] leading-[1.15] truncate">{artist.display_name}</span>
            {artist.is_verified && (
              <>
                <i className="ti ti-rosette-discount-check text-sm shrink-0" aria-hidden="true" />
                <span className="sr-only">Verified</span>
              </>
            )}
          </div>
          <div className="text-[11px] opacity-90 mt-0.5 truncate">{subtitle}</div>
        </div>
      </div>
    </Link>
  );
}
