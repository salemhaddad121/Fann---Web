import type { MediaItem } from "@/types/artists";

/**
 * Minimum media on an ARTIST profile. Bookers are exempt entirely — most
 * are venues or companies with nothing to photograph, and requiring even a
 * logo would cost signups on the side of the marketplace that pays.
 *
 * Mirrors src/artists/profile-completeness.ts in the API. Duplicated rather
 * than fetched because the form has to react as photos are added and
 * removed, before anything is saved — a round trip per upload would make
 * the requirement feel laggy and wrong. The API remains the authority; this
 * only decides what the form asks for.
 */
export const REQUIRED_PROFILE_PICTURES = 1;
export const REQUIRED_GALLERY_IMAGES = 2;

/**
 * What the profile is still missing, phrased for a person.
 *
 * Returns an empty array when the minimum is met. Videos deliberately do
 * not count toward the gallery: the requirement exists so a search result
 * has something to show, and a video thumbnail is not guaranteed.
 */
export function mediaShortfall(media: MediaItem[]): string[] {
  const photos = media.filter((m) => m.media_type === "photo");
  const profilePictures = photos.filter((m) => m.is_primary).length;
  const galleryImages = photos.filter((m) => !m.is_primary).length;

  const missing: string[] = [];

  if (profilePictures < REQUIRED_PROFILE_PICTURES) {
    missing.push("a profile picture");
  }

  if (galleryImages < REQUIRED_GALLERY_IMAGES) {
    const short = REQUIRED_GALLERY_IMAGES - galleryImages;
    // The shortfall, not the total: "1 more gallery image" is actionable,
    // "2 gallery images required" when you already have one is not.
    missing.push(`${short} more gallery image${short === 1 ? "" : "s"}`);
  }

  return missing;
}
