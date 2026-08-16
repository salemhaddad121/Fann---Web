/**
 * Where this deployment lives, and how it describes itself.
 *
 * Metadata, the sitemap and robots.txt all need an absolute origin, and a
 * relative path will not do — a crawler reading /sitemap.xml has to be told
 * the full URL of every page in it.
 *
 * NEXT_PUBLIC_SITE_URL overrides this per environment and is the mechanism
 * that should actually be used — set it on every deployment, including
 * previews, or a preview will canonicalise its pages onto the production
 * ones it is not serving.
 *
 * ⚠️ The default must be a domain that RESOLVES, which is why it is the
 * current live origin and not fann-leb.com. This briefly defaulted to
 * fann-leb.com on the reasoning that it is the decided primary domain — but
 * it is not live yet, so production shipped canonicals, a robots.txt Host
 * and a sitemap all naming a host that 404s. Pointing a canonical at a dead
 * URL is worse than pointing it at an old one: an old domain 301s to the
 * new one and the signal survives, where a 404 is just a crawl error on
 * every page at once.
 *
 * At the Wave E cutover this becomes fann-leb.com — but by then the right
 * fix is to set NEXT_PUBLIC_SITE_URL and stop relying on the default.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fann.guru"
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
