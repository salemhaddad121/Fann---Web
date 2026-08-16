import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ArtistDetailClient } from "./ArtistDetailClient";
import { getArtist } from "@/lib/artists-api";
import { artistSeoTitle, artistSeoDescription } from "@/lib/artist-seo";
import { DEFAULT_OG_IMAGE } from "@/lib/site-config";
import type { ArtistDetail } from "@/types/artists";

/**
 * The most indexable page Fann has, and until now a JS shell.
 *
 * The split: this server component owns the metadata and, for a visitor
 * with no session, the profile data itself — so the HTML a crawler receives
 * already contains the bio, the categories and the city. Everything
 * interactive (saving, messaging, proposing a booking, the calendar) stays
 * in the client component below it, which is where it has to be.
 */

/** The API session cookie. httpOnly, so only the server can see it. */
const SESSION_COOKIE = "accessToken";

async function loadArtist(id: string): Promise<ArtistDetail | null> {
  // No credentials are forwarded, so this is the guest-tier view of the
  // record — masked name, banded price, no contact details. That is exactly
  // what should be public, and exactly what belongs in metadata.
  return getArtist(id).catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const artist = await loadArtist(id);

  if (!artist) {
    return { title: "Artist not found", robots: { index: false, follow: true } };
  }

  const title = artistSeoTitle(artist);
  const description = artistSeoDescription(artist);
  const canonical = `/artists/${id}`;

  // The artist's own photo when there is one. thumbnail_url is served from
  // the media CDN, which is not bound as a custom domain yet — until it is,
  // these resolve to nothing and the site-wide fallback is what shows.
  const image = artist.thumbnail_url || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Only anonymous visitors get a server-rendered profile. A signed-in one
  // would be served the anonymous view first and then have it corrected on
  // the client, which means a subscriber watching the name they paid for
  // resolve out of a mask. Fetching per-viewer on the server instead would
  // mean forwarding the session cookie across subdomains, and whether that
  // cookie is even scoped to work across them is an open question for the
  // domain migration — so this deliberately waits for that to be settled.
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  const initialArtist = signedIn ? null : await loadArtist(id);

  return <ArtistDetailClient id={id} initialArtist={initialArtist} />;
}
