import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from "@/lib/site-config";
import { SOCIAL_LINKS } from "@/lib/site-links";

/**
 * Organisation structured data for the home page.
 *
 * The point of this is not rich results — it is that someone who has just
 * been cold-called searches "Fann" and needs the first result to obviously
 * be this company. Structured data is what lets Google tie the name, the
 * domain, the description and the social profiles into one entity instead of
 * guessing from a three-letter word that means something else in Arabic.
 *
 * sameAs is the strongest signal here and is currently empty: the social
 * accounts do not exist yet, so the links are all null in site-links.ts.
 * They are read from there rather than repeated, so creating the accounts
 * fills this in at the same time as the footer.
 */
export function OrganizationJsonLd() {
  const sameAs = SOCIAL_LINKS.map((s) => s.href).filter((href): href is string => Boolean(href));

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: absoluteUrl("/icons/icon-512.png"),
    areaServed: { "@type": "Country", name: "Lebanon" },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // The content is built from our own constants, not user input, so
      // there is nothing here that could close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
