"use client";

import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { createSupportTicket } from "@/lib/support-api";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";

/**
 * Deletion request for someone who cannot sign in.
 *
 * Files an ordinary support ticket rather than deleting anything. It has to
 * be usable by a stranger — that is the entire point of the page — so it
 * cannot be given the power to delete an account on the strength of a typed
 * email address. Identity is confirmed by a person before anything happens.
 *
 * Deliberately does not call useAuth: this must render and work identically
 * whether or not there is a session, and a signed-in user reading it should
 * still be pointed at the in-app route, which is faster and self-service.
 */
export function DeleteAccountRequestForm() {
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const address = email.trim();
    if (!address || !address.includes("@")) {
      setError("Enter the email address on the account so we can find it.");
      return;
    }

    setSending(true);
    try {
      await createSupportTicket({
        subject: "Account deletion request",
        body: [
          "This request was submitted from the public account deletion page.",
          `Account email as given: ${address}`,
          details.trim() ? `Additional details: ${details.trim()}` : "No additional details given.",
        ].join("\n\n"),
        // Sent as the guest address so there is somewhere to reply even
        // when the requester has no session. The server ignores this and
        // uses the real account address if they turn out to be signed in.
        guestEmail: address,
        sourcePath: "/delete-account",
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't send that request. Please email us instead.",
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-[14px] border border-hairline bg-surface p-5">
        <h2 className="text-base font-bold text-ink">Request received</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We have your request and will reply to <strong>{email.trim()}</strong> to
          confirm it is really you before anything is deleted. If you do not
          hear back within a few days, check your spam folder and then contact
          us again.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[14px] border border-hairline bg-surface p-5">
      <h2 className="text-base font-bold text-ink">Request deletion</h2>
      <p className="mt-1 text-sm text-muted">
        Use this if you cannot sign in. We will reply to confirm it is you
        before deleting anything.
      </p>

      {error && (
        <div className="mt-3">
          <Banner kind="error">{error}</Banner>
        </div>
      )}

      <div className="mt-4">
        <FormField
          label="Email address on the account"
          name="account-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <label className="mt-3 block text-sm font-medium text-ink">
        Anything else we should know (optional)
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          placeholder="For example, the name on the profile, or why you cannot sign in."
          className="mt-1.5 w-full rounded-[10px] border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-clay"
        />
      </label>

      <div className="mt-4">
        <Button type="submit" loading={sending}>
          Send deletion request
        </Button>
      </div>
    </form>
  );
}
