import Link from "next/link";
import { ArtistCard } from "@/components/search/ArtistCard";
import type { ArtistSearchResponse } from "@/types/artists";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** Cards in the strip. Five fits the 1024px content column at ~189px each. */
const STRIP_LIMIT = 5;

/**
 * Real artist photography, directly under the landing hero.
 *
 * The landing page carried no artist imagery at all while /search is full of
 * it, which left the one thing a stranger doubts about an unfamiliar
 * marketplace — that there is anybody on it — unanswered until they clicked
 * through. This is the answer, above the fold.
 *
 * Same approach as ArtistShowcase on the marketing pages, and ArtistCard is
 * reused rather than reimplemented: it is not a client component and its only
 * handler sits behind an optional callback that is not passed here, so it
 * renders on the server unchanged. That also means the strip inherits the
 * masking rules for free — fetched without credentials, so these are guest
 * cards, with names withheld and prices banded, which is exactly what a
 * logged-out visitor and a crawler should both see.
 *
 * A failure costs the strip, not the page: null out and the landing page
 * renders without it.
 */
async function fetchArtists(): Promise<ArtistSearchResponse | null> {
  try {
    // No verifiedOnly. Every artist is ID-verified before their profile
    // goes live, so the parameter selected nothing and the distinction it
    // implied was never real — which is the whole of C1.
    const qs = new URLSearchParams({ page: "1" });
    const res = await fetch(`${API_URL}/artists?${qs}`, {
      headers: { "Content-Type": "application/json" },
      // The roster changes slowly; this keeps the landing page from making a
      // request per view. Matches the hour used by the taxonomy and plans.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ArtistSearchResponse;
  } catch {
    return null;
  }
}

export async function ArtistStrip() {
  const result = await fetchArtists();
  const artists = result?.data.slice(0, STRIP_LIMIT) ?? [];
  if (artists.length === 0) return null;

  return (
    <section className="pb-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {/* "Verified artists" was accurate only because the request asked
            for verifiedOnly=true. It no longer does, and the filter selected
            nothing anyway — every artist is ID-verified before going live.
            The heading now says what the strip actually is. */}
        <h2 className="font-display text-[20px] lg:text-[22px] font-bold text-ink">
          Artists on Fann
        </h2>
        <Link href="/search" className="text-sm font-semibold text-clay-deep">
          Browse all artists →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </section>
  );
}
