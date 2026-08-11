import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { CONSENT_VERSIONS } from "@/lib/consent-versions";

export const metadata: Metadata = {
  title: "Terms of Service — Fann",
};

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Service" version={CONSENT_VERSIONS.terms}>
      <p>
        Fann is a marketplace that connects artists with the people booking
        them for events in Lebanon. These terms will cover how accounts work,
        what each side is responsible for when a booking is agreed, and what
        happens when something goes wrong.
      </p>
      <p>
        Fann provides the platform where artists and bookers find each other
        and agree terms. Any booking is an agreement between those two
        parties.
      </p>
      <p>
        Accounts are reviewed before they go live, and may be suspended for
        misuse — for example harassment, misrepresentation, or attempting to
        take agreed bookings off the platform.
      </p>
      <p>
        The full text is being prepared and will replace this page. When it
        does, its version will change and you may be asked to accept the
        revised document.
      </p>
    </LegalDocument>
  );
}
