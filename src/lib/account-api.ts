import { apiFetch } from "@/lib/api";

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}

// Doesn't take effect immediately — the backend sends a verification link
// to the new address, and the email only actually changes once that's
// clicked (reuses the same /auth/verify-email flow as signup).
export async function changeEmail(
  currentPassword: string,
  newEmail: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/email", {
    method: "PATCH",
    body: { currentPassword, newEmail },
  });
}

export async function deleteAccount(password: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/me", {
    method: "DELETE",
    body: { password },
  });
}

// ----------------------------------------------------------------
// Communication preferences
//
// Marketing only. The API refuses to change terms or privacy through this
// endpoint — those are conditions of use, and withdrawing them is
// deleting the account, which is its own flow.
// ----------------------------------------------------------------
export async function getMarketingConsent(): Promise<{ granted: boolean }> {
  return apiFetch<{ granted: boolean }>("/consent/marketing");
}

export async function setMarketingConsent(
  granted: boolean,
): Promise<{ granted: boolean }> {
  return apiFetch<{ granted: boolean }>("/consent/marketing", {
    method: "PUT",
    body: { granted },
  });
}

// ----------------------------------------------------------------
// Acceptance of the mandatory documents
//
// Separate calls from the marketing preference above, matching the API:
// marketing is a preference that toggles, terms and privacy are conditions
// that can only ever be accepted. There is no endpoint for un-accepting
// them, because that is account closure rather than a setting.
// ----------------------------------------------------------------
export interface ConsentStatus {
  /** Mandatory documents not accepted at their current version. */
  outdated: string[];
  needs_acceptance: boolean;
}

export async function getConsentStatus(): Promise<ConsentStatus> {
  return apiFetch<ConsentStatus>("/consent/status");
}

export async function acceptDocuments(
  documents: string[],
): Promise<{ outdated: string[] }> {
  return apiFetch<{ outdated: string[] }>("/consent/accept", {
    method: "POST",
    body: { documents },
  });
}

/**
 * Withdraw marketing consent from an email link, with no session.
 *
 * auth:false because the caller has not logged in and should not have to —
 * the token in the link is the proof. Sending a session here would also make
 * a 401 trigger a pointless refresh for someone who has none.
 */
export async function unsubscribe(token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/consent/unsubscribe", {
    method: "POST",
    body: { token },
    auth: false,
  });
}
