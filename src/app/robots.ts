import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

/**
 * robots.txt, as a route rather than a file in public/.
 *
 * It has to name the sitemap with an absolute URL, and the origin differs
 * per deployment, so it cannot be a static file without hardcoding one.
 *
 * The disallow list has no technical force — a scraper simply ignores it,
 * and the real defences are the edge rate limits and pagination caps in
 * Wave G. Its job is a legal one: publishing it is what makes automated
 * scraping of those paths a breach of terms rather than ordinary browsing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/auth/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
