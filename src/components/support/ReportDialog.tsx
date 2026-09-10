"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { createSupportTicket } from "@/lib/support-api";

/** What can be reported, and how each reads in the ticket. */
export type ReportTargetKind = "artist" | "planner" | "conversation";

const TARGET_LABEL: Record<ReportTargetKind, string> = {
  artist: "artist profile",
  planner: "planner profile",
  conversation: "conversation",
};

/**
 * The normalised route for each kind — the same shape page telemetry uses,
 * with no id in it. See the note in handleSubmit on why the id travels in
 * the body instead.
 */
const SOURCE_PATH: Record<ReportTargetKind, string> = {
  artist: "/artists/[id]",
  planner: "/planners/[id]",
  conversation: "/messages/[id]",
};

/**
 * The grounds come from the platform's own stated reasons for suspending an
 * account rather than a generic abuse list — offering a category Fann does
 * not act on teaches people that reporting is pointless.
 */
const REASONS = [
  "Harassment or abusive messages",
  "Misrepresentation — not who they claim to be",
  "Trying to take a booking off the platform",
  "Inappropriate or unlawful content",
  "Something else",
] as const;

/**
 * In-context reporting (T&C §25.3).
 *
 * Reporting used to mean finding the footer, clicking through to /help, and
 * describing the problem in a blank contact form that carried no reference
 * to what was being reported. Someone being harassed in a thread had no
 * button where the harassment was, and support received reports they could
 * not act on because nothing said who or what was involved.
 */
export function ReportDialog({
  kind,
  targetId,
  targetName,
}: {
  kind: ReportTargetKind;
  /** The profile or conversation id. Support needs this to act. */
  targetId: string;
  /** Shown to the reporter only. Absent when a name is masked. */
  targetName?: string | null;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [detail, setDetail] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = TARGET_LABEL[kind];

  async function handleSubmit() {
    if (detail.trim().length < 10) {
      setError("Tell us what happened, so someone can act on it.");
      return;
    }
    if (!user && !guestEmail.trim()) {
      setError("We need an email address to reply to.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      await createSupportTicket({
        subject: `Report: ${label}`,
        // The id goes in the BODY, deliberately, and not in sourcePath.
        // sourcePath is normalised on purpose so passive telemetry never
        // records which artist someone looked at. A report is the opposite
        // situation: the reporter is choosing to tell us what this is about,
        // and a report support cannot trace back to a profile is one nobody
        // can act on. Different data, different rule.
        body: [
          `Reported ${label}: ${targetId}`,
          targetName ? `Shown as: ${targetName}` : null,
          `Reason: ${reason}`,
          "",
          detail.trim(),
        ]
          .filter(Boolean)
          .join("\n"),
        ...(user ? {} : { guestEmail: guestEmail.trim() }),
        sourcePath: SOURCE_PATH[kind],
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't send that. Please try again in a moment.",
      );
    } finally {
      setSending(false);
    }
  }

  function close() {
    setOpen(false);
    // Reset, so a second report does not open pre-filled with the first.
    setSent(false);
    setDetail("");
    setError(null);
    setReason(REASONS[0]);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-faint hover:text-danger"
      >
        <i className="ti ti-flag text-sm" aria-hidden />
        Report this {label}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="flex max-h-[90vh] w-full flex-col overflow-hidden bg-surface sm:max-w-md sm:rounded-2xl">
        {sent ? (
          <div className="p-5">
            <h2 className="text-base font-bold text-ink">Thanks — that is with us</h2>
            <p className="mt-2 text-sm text-muted">
              Someone will review it. We may email you if we need more detail.
              You will not be told what action was taken about another account.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-4 w-full rounded-[10px] bg-clay-deep py-2.5 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex flex-col overflow-y-auto p-5">
            <h2 className="text-base font-bold text-ink">Report this {label}</h2>
            <p className="mt-1 text-xs text-muted">
              Reports go to Fann&apos;s support team. The other side is not told
              who reported them.
            </p>

            {error && (
              <p className="mt-3 rounded-[10px] border border-[#FCA5A5] bg-danger-bg px-3 py-2 text-xs text-danger">
                {error}
              </p>
            )}

            <label className="mt-4 block text-sm font-medium text-ink">
              What is wrong?
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5 w-full rounded-[10px] border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-clay"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block text-sm font-medium text-ink">
              What happened?
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={4}
                placeholder="Dates, what was said, anything that helps us check."
                className="mt-1.5 w-full resize-none rounded-[10px] border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-clay"
              />
            </label>

            {!user && (
              <label className="mt-3 block text-sm font-medium text-ink">
                Your email
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-[10px] border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-clay"
                />
              </label>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-[10px] border border-hairline py-2.5 text-sm font-semibold text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={sending}
                className="flex-1 rounded-[10px] bg-clay-deep py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send report"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
