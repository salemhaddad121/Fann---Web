"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { acceptDocuments, getConsentStatus } from "@/lib/account-api";

const LABELS: Record<string, { name: string; href: string }> = {
  terms: { name: "Terms of Service", href: "/terms" },
  privacy: { name: "Privacy Policy", href: "/privacy" },
};

/**
 * Asks for agreement again when a document has been amended (T&C §33.2).
 *
 * A banner rather than a blocking modal. §33.2 asks that users be told and
 * given the chance to accept; it does not ask that the platform be taken
 * away from them mid-session until they click. A modal over an artist
 * profile someone is mid-booking on would also collect a click that means
 * "let me back in", which is a worse record of agreement than one made by
 * someone who chose to stop and read.
 *
 * Nothing renders until the check has answered, and nothing renders if it
 * fails. A prompt that appears because a request errored would ask people
 * to re-accept documents that have not changed.
 */
export function ReacceptancePrompt() {
  const [outdated, setOutdated] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getConsentStatus()
      .then(({ outdated }) => {
        if (!cancelled) setOutdated(outdated);
      })
      .catch(() => {
        // Silent on purpose — see above.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (outdated.length === 0) return null;

  const documents = outdated.filter((d) => LABELS[d]);
  if (documents.length === 0) return null;

  async function handleAccept() {
    setSaving(true);
    setError(null);
    try {
      const { outdated: still } = await acceptDocuments(documents);
      setOutdated(still);
    } catch {
      setError("Couldn't record that. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="border-b border-hairline bg-sand px-4 py-3">
      <div className="mx-auto flex max-w-3xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-snug text-muted">
          We&apos;ve updated our{" "}
          {documents.map((d, i) => (
            <span key={d}>
              {i > 0 && (i === documents.length - 1 ? " and " : ", ")}
              <Link
                href={LABELS[d].href}
                className="font-semibold text-clay-deep underline"
              >
                {LABELS[d].name}
              </Link>
            </span>
          ))}
          . Please read and accept to carry on using Fann.
          {error && <span className="ml-1 text-danger">{error}</span>}
        </p>
        <button
          type="button"
          onClick={handleAccept}
          disabled={saving}
          className="shrink-0 rounded-[10px] bg-clay-deep px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "I accept"}
        </button>
      </div>
    </div>
  );
}
