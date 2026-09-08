// Must stay in step with CONSENT_VERSIONS in the API
// (fann-api src/consent/consent.constants.ts). The API is what actually
// stores the version against an acceptance; these are here so the pages a
// user reads can show which revision they're agreeing to.
//
// When a document's wording changes: update the text, bump the date here,
// and bump the matching entry in the API. Existing stored consents keep
// their old version — that's the point of recording it.
//
// `marketing` has no page of its own. It versions the wording of the
// opt-in itself — the sentence beside the signup checkbox and on the
// account screen — because §24.2 consent has to be specific, so "they
// agreed to marketing" is only evidence if we can say which sentence they
// were shown. Change that wording and this date moves with it.
export const CONSENT_VERSIONS = {
  terms: "2026-08-11",
  privacy: "2026-08-11",
  marketing: "2026-09-08",
} as const;
