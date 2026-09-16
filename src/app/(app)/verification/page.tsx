"use client";

import { useRequireRole } from "@/lib/use-require-role";
import { VerificationChecklist } from "@/components/verification/VerificationChecklist";

/**
 * Artist identity verification.
 *
 * Artists only — the API 403s everyone else, and bookers are deliberately
 * ungated, so showing them this page would invite uploads of documents
 * nobody asked for and nobody should be storing. useRequireRole sends a
 * planner to their own home rather than leaving them on a page that is not
 * theirs.
 *
 * Note there is no <AppShell> here. `(app)/layout.tsx` already wraps every
 * route in this group in one, and this page wrapped its content in a SECOND
 * — which rendered two complete sidebars side by side, two logos, two nav
 * lists and two user cards, for every artist who opened it. This was the
 * only page in the group that did it.
 */
export default function VerificationPage() {
  const { ready } = useRequireRole("artist");

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-lg font-bold text-ink">Identity verification</h1>
      <p className="mt-1 text-sm text-muted">
        Two things: a photo ID, and a selfie so we can check it&apos;s you.
      </p>

      <div className="mt-5">
        <VerificationChecklist />
      </div>
    </div>
  );
}
