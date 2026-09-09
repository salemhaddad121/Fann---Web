import type { ReactNode } from "react";

/**
 * Every version of the Terms that has ever been live, kept forever.
 *
 * T&C §3.5 lets a user ask for the version they accepted, and signup
 * records a version string against every acceptance (user_consents). Those
 * two only mean something together: a stored "2026-08-11" is not evidence
 * of anything if the only text anyone can still read is whatever is current
 * today.
 *
 * So versions are ADDED here, never edited and never removed. Changing the
 * wording of an entry silently rewrites what a user is on record as having
 * agreed to — which is the exact failure the version string exists to
 * prevent. To publish a revision: add a new dated entry, then bump
 * CONSENT_VERSIONS.terms here and in the API. The old entry stays.
 *
 * Keys are dates because CONSENT_VERSIONS is dated — see the note there on
 * why "which text was live on that date" is answerable and "v3" is not.
 *
 * Privacy has no archive yet. It is versioned and accepted the same way, so
 * it will want one; §3.5 names the Terms, which is what this closes.
 */
export const TERMS_ARCHIVE: Record<string, ReactNode> = {
  "2026-08-11": (
    <>
      <p>
        Fann is a marketplace that connects artists with the people booking
        them for events in Lebanon. These terms will cover how accounts work,
        what each side is responsible for when a booking is agreed, and what
        happens when something goes wrong.
      </p>
      <p>
        Fann provides the platform where artists and planners find each other
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
    </>
  ),
};

/** Newest first, for listing published versions. */
export function termsVersions(): string[] {
  return Object.keys(TERMS_ARCHIVE).sort().reverse();
}
