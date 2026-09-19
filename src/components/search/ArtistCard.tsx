import Link from "next/link";
import { badgeColor } from "@/lib/badge-colors";
import { LockedName } from "@/components/profile/LockedField";
import type { ArtistCard as ArtistCardType } from "@/types/artists";

function formatPrice(value: ArtistCardType["base_price_usd"]) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!n || Number.isNaN(n)) return null;
  return `From $${n.toLocaleString()}`;
}

// Fades the photo out into the brand ink so white text stays legible over any
// image. Kept as an inline style rather than a Tailwind arbitrary value,
// because the stops carry alpha and read better spelled out.
//
// Ink, not navy. The old rgba(11,29,81) was the retired navy brand colour and
// read as a blue cast over every thumbnail; 16,10,6 is --ink #1E1712, so the
// fade now goes to the same black-brown the rest of the page is drawn in.
const NAME_BANNER_GRADIENT = "linear-gradient(rgba(16,10,6,0), rgba(16,10,6,0.9))";

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
  // The exact figure only reaches subscribers; everyone else gets a band.
  // Falling through to "Price on request" for a guest would hide budget
  // information the server is deliberately willing to share, and make the
  // whole roster look unpriced.
  // The band is already a range ("$250–$500"), so it is shown as-is rather
  // than prefixed with "From", which would read as a range of minimums.
  const price = formatPrice(artist.base_price_usd) ?? artist.base_price_band ?? null;
  const showSaveButton = onToggleSave !== undefined;
  const subtitle = [artist.location_city, price ?? "Price on request"]
    .filter(Boolean)
    .join(" · ");

  return (
    // A div, not the Link. The save button used to sit INSIDE the anchor,
    // which is a button nested in a link — invalid HTML, and it left the
    // heart dependent on preventDefault() to stop the card navigating out
    // from under it. The anchor now wraps only what is navigable and the
    // button is its sibling, layered over the same corner by the shared
    // `relative` on this element.
    <div className="relative bg-surface border border-hairline rounded-[14px] overflow-hidden flex flex-col">
      <Link href={`/artists/${artist.id}`} className="flex flex-1 flex-col">
        {/* Portrait 5:6-ish frame. The name banner below is a fixed ~93px tall,
            so on the old 64% (landscape) frame it swallowed 89% of the photo. */}
        <div className="relative w-full pt-[120%] bg-sand">
          {artist.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- external CDN URLs, no next.config domain list set up yet
            <img
              src={artist.thumbnail_url}
              // Falls back to the category rather than to nothing: below the
              // paying tier there is no name to describe the photo with.
              alt={artist.display_name ?? `${primaryCategory?.name ?? "Artist"} on Fann`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-faint">
              <i className="ti ti-user text-2xl" />
            </div>
          )}
          {primaryCategory && (
            <span
              className={`absolute top-1.5 left-1.5 z-10 text-[12px] font-semibold px-2 py-0.5 rounded-lg ${badgeColor(primaryCategory.slug)}`}
            >
              {primaryCategory.name}
            </span>
          )}

          <div
            className="absolute inset-x-0 bottom-0 px-[13px] pb-[11px] pt-[46px] text-white"
            style={{ backgroundImage: NAME_BANNER_GRADIENT }}
          >
            <div className="flex items-center gap-1">
              {artist.display_name ? (
                <span className="font-bold text-[15px] leading-[1.15] truncate">
                  {artist.display_name}
                </span>
              ) : (
                <LockedName onDark />
              )}
            </div>
            <div className="text-[12px] opacity-90 mt-0.5 truncate">{subtitle}</div>
          </div>
        </div>
      </Link>

      {/* Outside the anchor, above it. No preventDefault needed any more —
          the click never reaches a link, because it is not inside one. */}
      {showSaveButton && (
        <button
          onClick={() => onToggleSave?.()}
          aria-label={isSaved ? "Remove from saved" : "Save"}
          className="absolute top-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90"
        >
          <i className={`ti ${isSaved ? "ti-heart-filled text-danger" : "ti-heart text-muted"} text-sm`} />
        </button>
      )}
    </div>
  );
}
