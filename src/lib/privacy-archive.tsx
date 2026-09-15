import type { ReactNode } from "react";

/**
 * Every version of the Privacy Policy that has ever been live, kept forever.
 *
 * Same contract as TERMS_ARCHIVE and for the same reason: signup records a
 * version string against every privacy acceptance (user_consents), and a
 * stored "2026-08-11" is not evidence of anything if the only text anyone can
 * still read is whatever is current today.
 *
 * §3.5 names the Terms rather than the Privacy Policy, so this is not
 * strictly required — but the two documents are versioned and accepted
 * identically, and a user who asks which privacy notice they agreed to
 * deserves the same answer as one asking about the Terms.
 *
 * Versions are ADDED here, never edited and never removed. Editing an entry
 * silently rewrites what someone is on record as having agreed to.
 */
export const PRIVACY_ARCHIVE: Record<string, ReactNode> = {
  "2026-08-11": (
    <>
      <p>
        This policy will set out what personal data Fann collects, why, how
        long it is kept, and the choices you have over it.
      </p>
      <p>
        What is collected today: the account details you provide (email,
        phone, and your artist or planner profile), the media you upload,
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
    </>
  ),
};

/** Newest first, for listing published versions. */
export function privacyVersions(): string[] {
  return Object.keys(PRIVACY_ARCHIVE).sort().reverse();
}
