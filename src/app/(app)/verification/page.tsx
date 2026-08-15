"use client";

import Link from "next/link";
import { useRequireAuth } from "@/lib/use-require-auth";
import { AppShell } from "@/components/shell/AppShell";
import { VerificationChecklist } from "@/components/verification/VerificationChecklist";

/**
 * Artist identity verification.
 *
 * Artists only — the API 403s everyone else, and bookers are deliberately
 * ungated, so showing them this page would invite uploads of documents
 * nobody asked for and nobody should be storing.
 */
export default function VerificationPage() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading || !user) return null;

  if (user.role !== "artist") {
    return (
      <AppShell user={user}>
        <div className="mx-auto max-w-lg px-4 py-10 text-center">
          <p className="text-sm text-muted">
            Identity verification applies to artist accounts.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block text-sm font-semibold text-clay-deep underline"
          >
            Back to dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-lg px-4 py-6">
        <h1 className="text-lg font-bold text-ink">Identity verification</h1>
        <p className="mt-1 text-sm text-muted">
          Two things: a photo ID, and a selfie so we can check it&apos;s you.
        </p>

        <div className="mt-5">
          <VerificationChecklist />
        </div>
      </div>
    </AppShell>
  );
}
