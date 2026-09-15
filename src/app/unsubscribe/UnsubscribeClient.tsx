"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { unsubscribe } from "@/lib/account-api";

/**
 * Where an unsubscribe link in an email lands (T&C §24.2).
 *
 * The confirm button is the whole reason this is a page rather than the
 * link doing the work itself. Mail scanners and link prefetchers follow
 * GET links in email, so an unsubscribe that happened on page load would
 * quietly unsubscribe people who never clicked — and they would only find
 * out by noticing the emails stopped.
 *
 * Works signed out, because that is the point: the people most likely to
 * unsubscribe are the ones least likely to still be able to log in.
 *
 * The outcome is deliberately the same whether the token was valid or not.
 * A different message for a bad token would tell anyone holding one whether
 * an address is registered, and "we have stopped emailing you" is the
 * honest answer either way.
 */
export function UnsubscribeClient() {
  const token = useSearchParams().get("token");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnsubscribe() {
    if (!token) return;
    setSending(true);
    setError(null);
    try {
      await unsubscribe(token);
      setDone(true);
    } catch {
      setError("Couldn't complete that. Please try again in a moment.");
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-14">
      <Link href="/" className="font-display text-xl font-bold text-ink">
        fan<span className="text-clay">n</span>
      </Link>

      {!token ? (
        <>
          <h1 className="mt-8 text-2xl font-bold text-ink">Link incomplete</h1>
          <p className="mt-3 text-sm text-muted">
            This unsubscribe link is missing its code. Open the link straight
            from the email rather than copying part of it, or change the
            setting yourself under Settings → Communication.
          </p>
        </>
      ) : done ? (
        <>
          <h1 className="mt-8 text-2xl font-bold text-ink">Unsubscribed</h1>
          <p className="mt-3 text-sm text-muted">
            You will not receive marketing emails from Fann again. This does
            not affect emails about your account, bookings or payments — those
            are part of using the platform.
          </p>
          <p className="mt-3 text-sm text-muted">
            Changed your mind? You can turn them back on under Settings →
            Communication.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-[10px] bg-clay-deep px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to Fann
          </Link>
        </>
      ) : (
        <>
          <h1 className="mt-8 text-2xl font-bold text-ink">
            Stop marketing emails?
          </h1>
          <p className="mt-3 text-sm text-muted">
            You will stop receiving emails about new artists and Fann updates.
            Emails about your account, bookings and payments will keep coming —
            those are part of using the platform, not marketing.
          </p>

          {error && <p className="mt-3 text-sm text-danger">{error}</p>}

          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={sending}
            className="mt-6 w-full rounded-[10px] bg-clay-deep py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {sending ? "Unsubscribing…" : "Yes, unsubscribe me"}
          </button>

          <Link
            href="/"
            className="mt-3 block text-center text-sm font-semibold text-muted"
          >
            No, keep them
          </Link>
        </>
      )}
    </div>
  );
}
