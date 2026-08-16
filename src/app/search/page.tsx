import type { Metadata } from "next";
import { SearchClient } from "./SearchClient";

/**
 * The directory is genuinely interactive — filters, pagination and the whole
 * URL contract from the previous wave — so the body stays a client
 * component. This wrapper exists to give it a title and description, which
 * a client component cannot export.
 *
 * Note this page is not the SEO target for category queries, and should not
 * become one: Google treats query-string variants as filtered views of a
 * single page and discourages indexing internal search results. The pages
 * meant to rank for "djs in beirut" are the hub pages, which are blocked on
 * keyword research. This is indexed as the entry point to the directory.
 */
export const metadata: Metadata = {
  title: "Browse artists in Lebanon",
  description:
    "Search DJs, bands, photographers, MCs, dancers and more across Lebanon. Filter by category, city and price, and browse verified profiles without an account.",
  alternates: { canonical: "/search" },
  openGraph: {
    url: "/search",
    title: "Browse artists in Lebanon",
    description:
      "Search DJs, bands, photographers, MCs and more across Lebanon. No account needed to browse.",
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
