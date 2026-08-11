import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { CONSENT_VERSIONS } from "@/lib/consent-versions";

export const metadata: Metadata = {
  title: "Privacy Policy — Fann",
};

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy" version={CONSENT_VERSIONS.privacy}>
      <p>
        This policy will set out what personal data Fann collects, why, how
        long it is kept, and the choices you have over it.
      </p>
      <p>
        What is collected today: the account details you provide (email,
        phone, and your artist or booker profile), the media you upload,
        messages and bookings you exchange with other users, identity
        documents submitted for account review, and basic technical records
        — the IP address and browser used when you create an account or
        accept these documents, and anonymous page-timing used to understand
        how the app is used.
      </p>
      <p>
        Data is held on infrastructure operated by our hosting, database, and
        media-storage providers. Page-view records are deleted automatically
        after 90 days.
      </p>
      <p>
        The full text is being prepared and will replace this page. When it
        does, its version will change and you may be asked to accept the
        revised document.
      </p>
    </LegalDocument>
  );
}
