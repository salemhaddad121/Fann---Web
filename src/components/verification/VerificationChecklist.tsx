"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { getMyVerification, uploadIdentityDocument } from "@/lib/verification-api";
import {
  KIND_HINTS,
  KIND_LABELS,
  type IdDocumentKind,
  type IdDocumentStatus,
  type MyVerification,
  type VerificationDocument,
} from "@/types/verification";

const STATUS_STYLES: Record<IdDocumentStatus, string> = {
  missing: "bg-surface text-faint border-hairline",
  pending: "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]",
  approved: "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]",
  rejected: "bg-[#FEF2F2] text-[#7F1D1D] border-[#FCA5A5]",
};

const STATUS_LABELS: Record<IdDocumentStatus, string> = {
  missing: "Not uploaded",
  pending: "Awaiting review",
  approved: "Approved",
  rejected: "Rejected",
};

function DocumentRow({
  doc,
  onUploaded,
}: {
  doc: VerificationDocument;
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await uploadIdentityDocument(doc.kind, file);
      onUploaded();
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Couldn't upload that. Please try again.",
      );
    } finally {
      setBusy(false);
      // Reset so re-picking the same file still fires a change event.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  // Approved documents cannot be replaced from here. Re-uploading would
  // reset the row to pending and knock the account back out of review,
  // which is a support ticket rather than a feature.
  const canUpload = doc.status !== "approved";

  return (
    <div className="border-b border-hairline px-4 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{KIND_LABELS[doc.kind]}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {KIND_HINTS[doc.kind]}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[doc.status]}`}
        >
          {STATUS_LABELS[doc.status]}
        </span>
      </div>

      {doc.status === "rejected" && doc.rejection_reason && (
        <p className="mt-2 rounded-lg bg-[#FEF2F2] px-3 py-2 text-xs text-[#7F1D1D]">
          {doc.rejection_reason}
        </p>
      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {canUpload && (
        <div className="mt-3">
          <input
            ref={inputRef}
            type="file"
            // Photos only for a selfie; the ID may also be a PDF scan.
            accept={doc.kind === "selfie" ? "image/*" : "image/*,application/pdf"}
            // Opens the camera directly on a phone, which is the point of a
            // selfie — a live photo rather than one from the gallery.
            {...(doc.kind === "selfie" ? { capture: "user" as const } : {})}
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={busy}
            className="block w-full text-xs text-muted file:mr-3 file:rounded-[10px] file:border-0 file:bg-clay-deep file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-white disabled:opacity-50"
          />
          {busy && <p className="mt-1.5 text-xs text-muted">Uploading…</p>}
        </div>
      )}
    </div>
  );
}

/**
 * The artist's own view of identity verification.
 *
 * Renders every required document whether or not it exists, so the page is
 * a checklist rather than a list of what happens to have been uploaded —
 * an artist needs to see what is still missing, which an empty list cannot
 * convey.
 */
export function VerificationChecklist() {
  const [data, setData] = useState<MyVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setData(await getMyVerification());
    } catch {
      setError("Couldn't load your verification status.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!data) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  return (
    <div>
      {data.complete ? (
        <div className="mb-4 rounded-2xl border border-hairline bg-surface p-4">
          <p className="text-sm font-semibold text-success">Identity verified</p>
          <p className="mt-0.5 text-xs text-muted">
            Nothing more to do. Your profile can go live.
          </p>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border border-hairline bg-surface p-4">
          <p className="text-sm font-semibold text-ink">
            Your profile can&apos;t go live yet
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            We check every artist&apos;s identity before their profile is shown to
            planners. It protects you as much as them — a planner knows the person
            they&apos;re hiring is who they say they are.
          </p>
          {data.outstanding.length > 0 && (
            <ul className="mt-2.5 space-y-1">
              {data.outstanding.map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-xs text-clay-deep">
                  <i className="ti ti-point-filled mt-px text-sm" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-hairline bg-surface">
        {data.documents.map((doc) => (
          <DocumentRow key={doc.kind} doc={doc} onUploaded={load} />
        ))}
      </div>

      <p className="mt-3 px-1 text-[11px] leading-relaxed text-faint">
        These are stored privately and only ever seen by our review team. They are
        never shown on your profile and never sent to planners.
      </p>
    </div>
  );
}
