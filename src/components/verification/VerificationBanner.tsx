"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyVerification } from "@/lib/verification-api";
import type { MyVerification } from "@/types/verification";

/**
 * Dashboard prompt for an artist who is not yet verified.
 *
 * Without this an artist waits in pending_review with no idea why their
 * profile is not showing up — the account looks fine from the inside, and
 * nothing else on the dashboard explains that identity checks exist.
 *
 * Renders nothing once verification is complete. A permanent green tick
 * would just be noise on a page they see every day.
 */
export function VerificationBanner() {
  const [data, setData] = useState<MyVerification | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyVerification()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      // Silent: a failed load should not put an error block on an otherwise
      // working dashboard.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data || data.complete) return null;

  const started = data.documents.some((d) => d.status !== "missing");
  const rejected = data.documents.some((d) => d.status === "rejected");

  return (
    <div className="mb-4 rounded-2xl border border-hairline bg-surface p-5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-clay-deep">
        {rejected ? "Action needed" : "Before you go live"}
      </p>
      <p className="mt-1 text-base font-bold text-ink">
        {rejected
          ? "Something needs re-uploading"
          : started
            ? "Your documents are being reviewed"
            : "Verify your identity"}
      </p>
      <p className="mt-0.5 text-sm text-muted">
        {rejected
          ? "One of your documents was rejected. Upload a replacement and we'll take another look."
          : started
            ? "We'll email you once it's checked. Your profile goes live after that."
            : "Bookers only see artists whose identity we've checked. It takes a photo ID and a selfie."}
      </p>

      {data.outstanding.length > 0 && (
        <ul className="mt-2.5 space-y-1">
          {data.outstanding.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-xs text-muted">
              <i className="ti ti-point-filled mt-px text-sm" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/verification"
        className="mt-3 inline-block rounded-[10px] bg-clay-deep px-4 py-2.5 text-sm font-semibold text-white"
      >
        {started ? "View verification" : "Start verification"}
      </Link>
    </div>
  );
}
