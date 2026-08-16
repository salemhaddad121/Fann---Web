import type { Metadata } from "next";
import { PlannerDetailClient } from "./PlannerDetailClient";

/**
 * Planner profiles are members-only and are told not to be indexed.
 *
 * The page is behind useRequireAuth, so a logged-out visitor — and every
 * crawler — is redirected to the landing page. Left to itself Google would
 * collect a set of URLs that render nothing, report them as soft 404s, and
 * spend crawl budget rediscovering them. noindex says so explicitly.
 *
 * follow stays on: the redirect target and any links are still worth
 * traversing. These URLs are also deliberately absent from sitemap.ts.
 *
 * If planner profiles are ever made public this becomes an ordinary
 * generateMetadata like the artist page — but that is a product decision
 * about exposing the buyer side, not an SEO change.
 */
export const metadata: Metadata = {
  title: "Planner profile",
  robots: { index: false, follow: true },
};

export default async function PlannerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlannerDetailClient id={id} />;
}
