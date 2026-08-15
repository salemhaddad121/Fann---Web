"use client";

import { useEffect, useState } from "react";
import { listPendingDocuments, reviewIdDocument } from "@/lib/admin-api";
import { Pagination } from "@/components/admin/Pagination";
import { ViewDocumentLink } from "@/components/admin/ViewDocumentLink";
import { initialsFromName } from "@/lib/format";
import { badgeColor } from "@/lib/badge-colors";
import type { AdminIdDocument } from "@/types/admin";

export function DocumentsTab() {
  const [rows, setRows] = useState<AdminIdDocument[] | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPendingDocuments(page)
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setPages(res.meta.pages);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load pending documents.");
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      await reviewIdDocument(id, "approved");
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't approve that document.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) {
      setError("A rejection reason is required.");
      return;
    }
    setBusyId(id);
    try {
      await reviewIdDocument(id, "rejected", rejectReason.trim());
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reject that document.");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!rows) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  if (rows.length === 0) {
    return <p className="px-4 py-10 text-sm text-muted text-center">No pending ID documents.</p>;
  }

  return (
    <div>
      {rows.map((doc) => {
        const name = doc.display_name ?? doc.email;
        return (
          <div key={doc.id} className="px-4 py-3.5 border-b border-hairline">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${badgeColor(name)}`}>
                {initialsFromName(name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-ink truncate">{name}</span>
                  {/* The two artefacts are judged differently — an ID is
                      checked for validity, a selfie for whether it is the
                      same person — so the reviewer has to be told which
                      one they are looking at. */}
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      doc.kind === "selfie"
                        ? "border-[#93C5FD] bg-[#DBEAFE] text-[#1E40AF]"
                        : "border-hairline bg-surface text-muted"
                    }`}
                  >
                    {doc.kind === "selfie" ? "Selfie" : "ID"}
                  </span>
                </div>
                <div className="text-xs text-muted truncate">
                  {doc.role[0].toUpperCase() + doc.role.slice(1)} · {doc.account_code} · Uploaded{" "}
                  {new Date(doc.uploaded_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              </div>
            </div>

            <div className="mb-2 pl-[52px]">
              <ViewDocumentLink documentId={doc.id} />
            </div>

            {rejectingId === doc.id ? (
              <div className="pl-[52px]">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (required)"
                  rows={2}
                  className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-clay mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRejectingId(null);
                      setRejectReason("");
                    }}
                    className="text-xs font-semibold text-muted px-3 py-1.5 rounded-lg border border-hairline"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={busyId === doc.id}
                    onClick={() => handleReject(doc.id)}
                    className="text-xs font-semibold text-[#7F1D1D] px-3 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] disabled:opacity-50"
                  >
                    Confirm rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="pl-[52px] flex gap-2">
                <button
                  disabled={busyId === doc.id}
                  onClick={() => handleApprove(doc.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={busyId === doc.id}
                  onClick={() => setRejectingId(doc.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FEF2F2] text-[#7F1D1D] border border-[#FCA5A5] disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
