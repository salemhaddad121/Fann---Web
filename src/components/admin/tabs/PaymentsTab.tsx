"use client";

import { useEffect, useState } from "react";
import { listPendingPayments, reviewPayment } from "@/lib/admin-api";
import { Pagination } from "@/components/admin/Pagination";
import type { AdminPayment } from "@/types/admin";

// Keys are the payment_service enum values from migration 001, which are
// capitalised. The lowercase keys this had before never matched, so every
// row fell through to showing the raw value.
const SERVICE_LABELS: Record<string, string> = {
  OMT: "OMT",
  Wish: "Whish Money",
  WesternUnion: "Western Union",
  other: "Other",
};

const PLAN_LABELS: Record<string, string> = {
  day: "Day pass",
  month: "Monthly",
  year: "Yearly",
};

/**
 * What the admin is actually approving.
 *
 * Without this the row shows a dollar amount and nothing else, so a pack of
 * ten day passes and a single yearly plan look identical at a glance — and
 * confirming is what mints the subscription.
 */
function PlanSummary({ payment }: { payment: AdminPayment }) {
  if (!payment.plan_code) {
    return <span className="text-faint">Legacy payment · no plan attached</span>;
  }
  const label = PLAN_LABELS[payment.plan_code] ?? payment.plan_code;
  return (
    <span className="font-semibold text-ink">
      {label}
      {payment.quantity > 1 && ` × ${payment.quantity}`}
    </span>
  );
}

export function PaymentsTab() {
  const [rows, setRows] = useState<AdminPayment[] | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPendingPayments(page)
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setPages(res.meta.pages);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load pending payments.");
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  async function handleConfirm(id: string) {
    setBusyId(id);
    try {
      await reviewPayment(id, "confirmed");
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't confirm that payment.");
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
      await reviewPayment(id, "rejected", rejectReason.trim());
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reject that payment.");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!rows) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  if (rows.length === 0) {
    return <p className="px-4 py-10 text-sm text-muted text-center">No pending payments.</p>;
  }

  return (
    <div>
      {rows.map((p) => (
        <div key={p.id} className="px-4 py-3.5 border-b border-hairline">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="text-[13px] font-semibold text-ink">
                {p.display_name ?? p.company_name ?? p.email}
              </div>
              <div className="text-xs text-muted">
                <PlanSummary payment={p} />
              </div>
              <div className="text-xs text-muted">
                {p.account_code}
                {p.transfer_service
                  ? ` · ${SERVICE_LABELS[p.transfer_service] ?? p.transfer_service}`
                  : " · transfer not reported yet"}
                {p.reference_code && ` · Ref ${p.reference_code}`}
              </div>
              {/* Only legacy payments carry a period. New ones have none
                  until the subscription they buy is activated, and feeding
                  null to new Date() renders "Invalid Date". */}
              {p.period_start && p.period_end && (
                <div className="text-xs text-faint">
                  Period: {new Date(p.period_start).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {" – "}
                  {new Date(p.period_end).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-base font-bold text-ink">${Number(p.amount_usd).toLocaleString()}</div>
              <div className="text-[11px] text-faint">
                {new Date(p.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </div>
            </div>
          </div>

          {rejectingId === p.id ? (
            <div>
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
                  disabled={busyId === p.id}
                  onClick={() => handleReject(p.id)}
                  className="text-xs font-semibold text-[#7F1D1D] px-3 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] disabled:opacity-50"
                >
                  Confirm rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                disabled={busyId === p.id}
                onClick={() => handleConfirm(p.id)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] disabled:opacity-50"
              >
                Confirm payment
              </button>
              <button
                disabled={busyId === p.id}
                onClick={() => setRejectingId(p.id)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FEF2F2] text-[#7F1D1D] border border-[#FCA5A5] disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
