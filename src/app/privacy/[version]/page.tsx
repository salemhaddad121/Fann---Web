import type { Metadata } from "next";
import {
  ArchivedDocumentPage,
  archivedMetadata,
} from "@/components/legal/ArchivedDocumentPage";
import { CONSENT_VERSIONS } from "@/lib/consent-versions";
import { PRIVACY_ARCHIVE, privacyVersions } from "@/lib/privacy-archive";

/**
 * Every published version is pre-rendered, which is what makes these URLs
 * permanent: they keep resolving with no database and no running API.
 */
export function generateStaticParams() {
  return privacyVersions().map((version) => ({ version }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}): Promise<Metadata> {
  const { version } = await params;

  return archivedMetadata({
    title: "Privacy Policy",
    version,
    currentVersion: CONSENT_VERSIONS.privacy,
    basePath: "/privacy",
    exists: Boolean(PRIVACY_ARCHIVE[version]),
  });
}

export default async function ArchivedPrivacyPage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;

  return (
    <ArchivedDocumentPage
      title="Privacy Policy"
      version={version}
      currentVersion={CONSENT_VERSIONS.privacy}
      body={PRIVACY_ARCHIVE[version]}
      currentHref="/privacy"
    />
  );
}
