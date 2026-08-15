"use client";

import { useState } from "react";
import { getDocumentViewUrl } from "@/lib/verification-api";

/**
 * Opens an identity document in a new tab via a short-lived presigned link.
 *
 * Fetched on click rather than up front: the link expires in five minutes,
 * so pre-loading one per row would leave most of them dead by the time a
 * reviewer worked down the queue. These files are not on the public CDN the
 * way profile media is, so this is the only way to see one — which is the
 * point.
 */
export function ViewDocumentLink({ documentId }: { documentId: string }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function open() {
    setBusy(true);
    setFailed(false);
    try {
      const url = await getDocumentViewUrl(documentId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-clay-deep underline disabled:opacity-50"
    >
      <i className="ti ti-external-link text-sm" aria-hidden />
      {busy ? "Opening…" : failed ? "Couldn't open — retry" : "View document"}
    </button>
  );
}
