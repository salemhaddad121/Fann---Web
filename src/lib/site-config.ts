/**
 * Where this deployment lives, and how it describes itself.
 *
 * Metadata, the sitemap and robots.txt all need an absolute origin, and a
 * relative path will not do — a crawler reading /sitemap.xml has to be told
 * the full URL of every page in it.
 *
 * NEXT_PUBLIC_SITE_URL overrides the default per environment. The default is
 * the decided primary domain rather than the current one: fann-leb.com is
 * where everything is moving, and pointing new SEO surface at a domain being
 * retired would be self-defeating. Set the variable on any deployment that
 * is not the production site — a preview that advertises the production
 * origin will have its pages canonicalised onto pages it is not serving.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fann-leb.com"
).replace(/\/+$/, "");

export const SITE_NAME = "Fann";

/** The brand line. Used as the home page title and the OpenGraph site name. */
export const SITE_TAGLINE = "Book Lebanon's live talent";

export const SITE_DESCRIPTION =
  "Fann connects event planners with DJs, bands, photographers, MCs and more across Lebanon. Browse verified profiles, compare portfolios and book directly — no booking commissions.";

/**
 * Fallback share image.
 *
 * The app icon, not a designed share card: a 1200x630 OpenGraph image is a
 * design job and design is deliberately out of scope here. It is square, so
 * it renders as a small thumbnail rather than a wide banner — worth
 * replacing, but a real image beats a broken one, and every one of these
 * links is going to be pasted into WhatsApp.
 */
export const DEFAULT_OG_IMAGE = "/icons/icon-512.png";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
