import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { CONSENT_VERSIONS } from "@/lib/consent-versions";
import { TERMS_ARCHIVE, termsVersions } from "@/lib/terms-archive";

/**
 * A permanent address for one version of the Terms (§3.5).
 *
 * Every published version is pre-rendered, so these URLs keep resolving
 * without a database or a running API — which is the point of calling them
 * permanent. An unknown version 404s rather than falling back to the
 * current text: quietly serving today's wording to someone who asked for
 * the version they accepted is worse than telling them it is not there.
 */
export function generateStaticParams() {
  return termsVersions().map((version) => ({ version }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}): Promise<Metadata> {
  const { version } = await params;

  if (!TERMS_ARCHIVE[version]) {
    return { title: "Terms version not found", robots: { index: false, follow: true } };
  }

  return {
    title: `Terms of Service (${version})`,
    alternates: { canonical: `/terms/${version}` },
    // Superseded versions must not compete with /terms in search results.
    // They stay readable and linkable; they are just not the page a
    // stranger should land on.
    robots:
      version === CONSENT_VERSIONS.terms ? undefined : { index: false, follow: true },
  };
}

export default async function ArchivedTermsPage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  const body = TERMS_ARCHIVE[version];

  if (!body) notFound();

  const isCurrent = version === CONSENT_VERSIONS.terms;

  return (
    <LegalDocument title="Terms of Service" version={version}>
      {!isCurrent && (
        <div className="rounded-xl border border-hairline bg-sand px-4 py-3">
          <p className="text-xs leading-relaxed text-muted">
            This is a superseded version, kept so it can still be read by
            anyone who accepted it.{" "}
            <Link href="/terms" className="font-semibold text-clay-deep underline">
              Read the current Terms
            </Link>
            .
          </p>
        </div>
      )}
      {body}
    </LegalDocument>
  );
}
