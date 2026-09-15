import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/LegalDocument";

/**
 * One version of a versioned legal document, at a permanent address (§3.5).
 *
 * Shared by /terms/[version] and /privacy/[version]. The two routes differ
 * only in title, archive and canonical path — everything that makes these
 * URLs *permanent* rather than merely reachable is the same, and is the part
 * worth having in one place:
 *
 *  - an unknown version 404s rather than falling back to the current text.
 *    Quietly serving today's wording to someone who asked for the version
 *    they accepted is worse than telling them it is not there.
 *  - a superseded version is noindex, so it stays readable and linkable
 *    without competing with the live document in search.
 */
export function ArchivedDocumentPage({
  title,
  version,
  currentVersion,
  body,
  currentHref,
}: {
  title: string;
  version: string;
  currentVersion: string;
  body: ReactNode | undefined;
  /** Where "read the current one" points. */
  currentHref: string;
}) {
  if (!body) notFound();

  const isCurrent = version === currentVersion;

  return (
    <LegalDocument title={title} version={version}>
      {!isCurrent && (
        <div className="rounded-xl border border-hairline bg-sand px-4 py-3">
          <p className="text-xs leading-relaxed text-muted">
            This is a superseded version, kept so it can still be read by
            anyone who accepted it.{" "}
            <Link href={currentHref} className="font-semibold text-clay-deep underline">
              Read the current {title}
            </Link>
            .
          </p>
        </div>
      )}
      {body}
    </LegalDocument>
  );
}

/**
 * Metadata shared by both archived routes.
 *
 * Superseded versions carry noindex; the current one does not, because at
 * that point /terms/<version> and /terms are the same document and the
 * canonical below is what resolves the duplication.
 */
export function archivedMetadata({
  title,
  version,
  currentVersion,
  basePath,
  exists,
}: {
  title: string;
  version: string;
  currentVersion: string;
  basePath: string;
  exists: boolean;
}) {
  if (!exists) {
    return { title: `${title} version not found`, robots: { index: false, follow: true } };
  }

  return {
    title: `${title} (${version})`,
    alternates: { canonical: `${basePath}/${version}` },
    robots: version === currentVersion ? undefined : { index: false, follow: true },
  };
}
