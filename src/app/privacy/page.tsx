import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { CONSENT_VERSIONS } from "@/lib/consent-versions";
import { PRIVACY_ARCHIVE } from "@/lib/privacy-archive";

// Bare title — the root layout's template appends the brand.
export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

/**
 * The current Privacy Policy.
 *
 * The text lives in PRIVACY_ARCHIVE rather than here, so this page and
 * /privacy/[version] cannot drift: the current version is the archive entry
 * CONSENT_VERSIONS points at, not a second copy that happens to match.
 */
export default function PrivacyPage() {
  const version = CONSENT_VERSIONS.privacy;

  return (
    <LegalDocument title="Privacy Policy" version={version}>
      {PRIVACY_ARCHIVE[version]}

      <p className="text-xs text-faint">
        Permanent link to this version:{" "}
        <Link
          href={`/privacy/${version}`}
          className="font-semibold text-clay-deep underline"
        >
          /privacy/{version}
        </Link>
      </p>
    </LegalDocument>
  );
}
