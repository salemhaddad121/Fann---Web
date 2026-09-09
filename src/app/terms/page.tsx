import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { CONSENT_VERSIONS } from "@/lib/consent-versions";
import { TERMS_ARCHIVE } from "@/lib/terms-archive";

// Bare title — the root layout's template appends the brand.
export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
};

/**
 * The current Terms.
 *
 * The text itself lives in TERMS_ARCHIVE rather than here, so this page and
 * /terms/[version] cannot drift: the current version is the archive entry
 * CONSENT_VERSIONS points at, not a second copy that happens to match.
 */
export default function TermsPage() {
  const version = CONSENT_VERSIONS.terms;

  return (
    <LegalDocument title="Terms of Service" version={version}>
      {TERMS_ARCHIVE[version]}

      {/* The discoverable half of §3.5. A permanent URL nobody can find is
          only useful to someone who already knows the scheme. */}
      <p className="text-xs text-faint">
        Permanent link to this version:{" "}
        <Link
          href={`/terms/${version}`}
          className="font-semibold text-clay-deep underline"
        >
          /terms/{version}
        </Link>
      </p>
    </LegalDocument>
  );
}
