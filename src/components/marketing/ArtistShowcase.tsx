import Link from "next/link";
import { ArtistCard } from "@/components/search/ArtistCard";
import type { ArtistSearchResponse } from "@/types/artists";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** How many real profiles a page shows before sending people to search. */
const SHOWCASE_LIMIT = 4;

/**
 * Real artists, pulled live, for an event-type page.
 *
 * Fetched server-side and without credentials, so this is the guest view —
 * masked names, banded prices — which is exactly what a stranger reading a
 * marketing page should see, and what a crawler should index.
 *
 * ArtistCard is reused rather than reimplemented. It is not a client
 * component, and its only handler sits behind an optional callback that is
 * not passed here, so it renders on the server unchanged.
 */
async function fetchArtists(categories: string[]): Promise<ArtistSearchResponse | null> {
  try {
    const qs = new URLSearchParams({ categories: categories.join(","), page: "1" });
    const res = await fetch(`${API_URL}/artists?${qs}`, {
      headers: { "Content-Type": "application/json" },
      // The roster changes slowly and these pages are rebuilt on a timer
      // anyway; this keeps one marketing page from making a request per view.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ArtistSearchResponse;
  } catch {
    return null;
  }
}

export async function ArtistShowcase({
  heading,
  categories,
  emptyBlurb,
}: {
  heading: string;
  /** Category slugs, matching the seeded taxonomy. */
  categories: string[];
  /** Shown instead of the grid when nothing matches yet. */
  emptyBlurb: string;
}) {
  const result = await fetchArtists(categories);
  const artists = result?.data.slice(0, SHOWCASE_LIMIT) ?? [];
  const total = result?.meta.total ?? 0;
  const searchHref = `/search?categories=${encodeURIComponent(categories.join(","))}`;

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-display text-[20px] lg:text-[22px] font-bold text-ink">{heading}</h2>
        {total > 0 && (
          <Link href={searchHref} className="text-sm font-semibold text-clay-deep">
            See all {total} →
          </Link>
        )}
      </div>

      {/* A count is only worth printing when it is not embarrassing. Early on
          the honest move is to say nothing about how many and let the
          profiles speak, rather than announce "2 artists". */}
      {artists.length === 0 ? (
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          {emptyBlurb}{" "}
          <Link href="/search" className="font-semibold text-clay-deep underline">
            Browse everyone on Fann
          </Link>
          .
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </section>
  );
}
