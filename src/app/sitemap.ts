import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

/**
 * The sitemap, built from the live roster.
 *
 * Regenerated hourly rather than pinned at build time, so a new artist
 * appears without a redeploy. The handoff asks for this to keep up as the
 * roster grows, and an hour is well inside how fast anyone is signing up.
 */
export const revalidate = 3600;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/**
 * A hard stop on how far the roster is walked.
 *
 * The directory endpoints paginate, so building the sitemap means walking
 * them. Without a ceiling a paging bug — or a server that keeps answering
 * past the last page — turns a sitemap build into an unbounded loop against
 * the API. 60 pages of 20 is 1,200 profiles, far past anything Fann has, and
 * hitting it is a signal to paginate the sitemap itself rather than raise it.
 */
const MAX_PAGES = 60;

interface DirectoryRow {
  id: string;
  created_at?: string;
}

interface DirectoryResponse {
  data: DirectoryRow[];
  meta: { pages: number };
}

/**
 * Every profile id in a directory, paged through.
 *
 * Returns what it managed to collect rather than throwing. A sitemap is
 * regenerated on a timer, so a failed API call should cost one stale hour,
 * not a failed deployment — and a sitemap listing only the static pages is
 * a great deal better than a build that does not ship.
 */
async function collectProfiles(resource: "artists"): Promise<DirectoryRow[]> {
  const rows: DirectoryRow[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    let body: DirectoryResponse;
    try {
      const res = await fetch(`${API_URL}/${resource}?page=${page}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) break;
      body = (await res.json()) as DirectoryResponse;
    } catch {
      // Network error or malformed JSON — keep whatever came back before it.
      break;
    }

    if (!Array.isArray(body.data) || body.data.length === 0) break;
    rows.push(...body.data);
    if (page >= (body.meta?.pages ?? 1)) break;
  }

  return rows;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The pages that exist regardless of what the API says. Priorities are
  // relative to each other only: the home page and the directory are the
  // way in, the legal pages are there to be found rather than ranked.
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/plans`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/help`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Artists only.
  //
  // Planner profiles are deliberately absent. /planners/[id] is behind
  // useRequireAuth — a logged-out visitor is redirected to the landing page
  // — so every one of those URLs would be a soft 404 to a crawler, and a
  // sitemap full of them damages the crawl budget of the pages that do
  // resolve. They belong here only if planner profiles are ever made
  // public, which is a product decision rather than an SEO one.
  const artists = await collectProfiles("artists");

  // created_at stands in for lastModified. The directory does not report an
  // updated_at, so this is the honest date available rather than the ideal
  // one; it is dropped entirely when absent rather than faked with now(),
  // which would tell crawlers every profile changed on every regeneration.
  const profileEntry = (row: DirectoryRow, prefix: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${prefix}/${row.id}`,
    ...(row.created_at ? { lastModified: new Date(row.created_at) } : {}),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  });

  return [...staticEntries, ...artists.map((row) => profileEntry(row, "/artists"))];
}
