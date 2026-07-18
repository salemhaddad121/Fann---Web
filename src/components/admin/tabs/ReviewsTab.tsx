"use client";

import { useEffect, useState } from "react";
import { listAdminReviews, removeAdminReview } from "@/lib/admin-api";
import { Pagination } from "@/components/admin/Pagination";
import type { AdminReview } from "@/types/admin";

export function ReviewsTab() {
  const [rows, setRows] = useState<AdminReview[] | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAdminReviews(page)
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setPages(res.meta.pages);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load reviews.");
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  async function handleRemove(id: string) {
    setBusyId(id);
    try {
      await removeAdminReview(id);
      setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, is_visible: false } : r)) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove that review.");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!rows) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  if (rows.length === 0) {
    return <p className="px-4 py-10 text-sm text-muted text-center">No reviews yet.</p>;
  }

  return (
    <div>
      {rows.map((r) => (
        <div key={r.id} className="px-4 py-3.5 border-b border-hairline">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="flex text-indigo">
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} className={`ti text-xs ${i < r.overall_score ? "ti-star-filled" : "ti-star"}`} />
                ))}
              </div>
              {!r.is_visible && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#F1F5F9] text-[#334155]">
                  Hidden
                </span>
              )}
            </div>
            <span className="text-[11px] text-faint">
              {new Date(r.submitted_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <p className="text-xs text-muted mb-1">
            {r.reviewer_email} ({r.reviewer_role}) reviewing {r.reviewee_email} — {r.event_name}
          </p>
          {r.body && <p className="text-sm text-ink mb-2">{r.body}</p>}
          {r.is_visible && (
            <button
              disabled={busyId === r.id}
              onClick={() => handleRemove(r.id)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FEF2F2] text-[#7F1D1D] border border-[#FCA5A5] disabled:opacity-50"
            >
              Remove review
            </button>
          )}
        </div>
      ))}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
