/**
 * How an artist profile describes itself to a search engine.
 *
 * The rule that drives all of this: **never the artist's name**. A booker
 * searches "rock band in Beirut", not for a performer they have never heard
 * of, so the title is built from what they actually typed — the categories
 * and the city. This is also why the guest name-masking costs nothing in
 * search terms, and why it must not be weakened to chase indexing.
 *
 * Names are excluded even in their masked form. The server renders these
 * without a session, so display_name arrives as "Karim N." anyway, but the
 * point is that a name is the wrong thing to title the page with regardless
 * of how much of it is shown.
 */

import type { Category } from "@/types/artists";

/** Where the artist is, for a title. Falls back outward, never to nothing. */
export function artistLocation(city: string | null, country: string | null): string {
  const trimmedCity = city?.trim();
  if (trimmedCity) return trimmedCity;
  const trimmedCountry = country?.trim();
  if (trimmedCountry) return trimmedCountry;
  // Fann is Lebanon-only, so this is a fact rather than a guess — and a
  // title reading "DJ in Lebanon" still matches a real search.
  return "Lebanon";
}

/**
 * The category phrase, capped at two.
 *
 * Two is the compromise between distinguishing the page and keeping the
 * title inside the ~60 characters Google renders. The cap is what stops a
 * ten-category artist producing a title that is all comma.
 */
export function artistCategoryPhrase(categories: Category[]): string {
  const names = categories
    .map((c) => c.name?.trim())
    .filter((n): n is string => Boolean(n))
    // "Other" is a catch-all bucket, not something anyone searches for.
    .filter((n) => !n.toLowerCase().startsWith("other"));

  if (names.length === 0) return "Artist";
  if (names.length === 1) return names[0];
  return `${names[0]} & ${names[1]}`;
}

/**
 * The page title, minus the brand — the root layout's template appends it.
 *
 * ⚠️ These are near-duplicates by construction: two Beirut DJs both get
 * "DJ in Beirut". The category mix distinguishes many of them, but not all,
 * and Google will pick one of a duplicate set arbitrarily. The real fix is
 * the category-by-city hub pages, where one page ranks for the query and
 * links to every artist matching it, rather than twenty profiles competing
 * for the same phrase. That work is blocked on keyword research.
 */
export function artistSeoTitle(artist: {
  categories: Category[];
  location_city: string | null;
  location_country: string | null;
}): string {
  return `${artistCategoryPhrase(artist.categories)} in ${artistLocation(
    artist.location_city,
    artist.location_country,
  )}`;
}

/** Trim to a whole word at the limit, so a description never ends mid-word. */
export function truncateAtWord(text: string, limit: number): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= limit) return collapsed;
  const cut = collapsed.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\-—]+$/, "")}…`;
}

/**
 * The meta description.
 *
 * Prefers the artist's own bio, which is public at every tier and is the
 * only genuinely distinguishing text on the page — the generated fallback
 * is identical for every artist sharing a category and a city, which is
 * exactly the duplication being avoided elsewhere.
 */
export function artistSeoDescription(artist: {
  bio: string | null;
  categories: Category[];
  location_city: string | null;
  location_country: string | null;
}): string {
  const bio = artist.bio?.trim();
  if (bio) return truncateAtWord(bio, 155);

  const where = artistLocation(artist.location_city, artist.location_country);
  return `Book ${artistCategoryPhrase(artist.categories).toLowerCase()} in ${where} on Fann. Compare portfolios and availability, and book directly — no booking commissions.`;
}
