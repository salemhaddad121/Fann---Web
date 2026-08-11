"use client";

import { useEffect, useState } from "react";
import { getVerifications } from "@/lib/admin-api";
import { formatRelativeTime } from "@/lib/format";
import type { VerificationRecord, VerificationResult } from "@/types/admin";

const FILTERS: { key: VerificationResult | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "manually_approved", label: "Approved" },
  { key: "failed", label: "Failed" },
  { key: "passed", label: "Passed" },
];

const RESULT_STYLE: Record<VerificationResult, string> = {
  pending: "bg-sand text-muted border-hairline",
  passed: "bg-success-bg text-success border-[#86EFAC]",
  manually_approved: "bg-success-bg text-success border-[#86EFAC]",
  failed: "bg-danger-bg text-danger border-[#FCA5A5]",
};

const RESULT_LABEL: Record<VerificationResult, string> = {
  pending: "Pending",
  passed: "Passed",
  // Spelled out rather than shown as "Passed": an admin reading a document
  // is a different assurance from a provider check, and the log shouldn't
  // blur them.
  manually_approved: "Manually approved",
  failed: "Failed",
};

export function VerificationsTab() {
  const [rows, setRows] = useState<VerificationRecord[] | null>(null);
  const [filter, setFilter] = useState<VerificationResult | "all">("all");
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getVerifications(filter === "all" ? {} : { result: filter })
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setTotal(res.meta.total);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the verification log.");
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-hairline">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              // Cleared here rather than in the effect: resetting state
              // synchronously inside an effect is what react-hooks flags,
              // and the click is where "start loading" actually belongs.
              if (f.key !== filter) setRows(null);
              setFilter(f.key);
            }}
            aria-pressed={filter === f.key}
            className={`px-3 py-1 rounded-2xl text-xs border ${
              filter === f.key
                ? "bg-ink text-white border-ink font-semibold"
                : "border-hairline text-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!rows ? (
        <p className="px-4 py-10 text-sm text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="px-4 py-10 text-sm text-muted text-center">No records match.</p>
      ) : (
        <>
          <p className="px-4 pt-3 text-[11px] text-faint">{total} record{total === 1 ? "" : "s"}</p>
          {rows.map((r) => (
            <VerificationRow
              key={r.id}
              record={r}
              open={expanded === r.id}
              onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function VerificationRow({
  record,
  open,
  onToggle,
}: {
  record: VerificationRecord;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-hairline">
      <button onClick={onToggle} className="w-full text-left px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-ink truncate">{record.user_email}</span>
          <span
            className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-2xl border ${RESULT_STYLE[record.result]}`}
          >
            {RESULT_LABEL[record.result]}
          </span>
        </div>
        <p className="text-[11px] text-faint mt-0.5">
          {record.user_account_code} · {record.user_role} · opened{" "}
          {formatRelativeTime(record.created_at)}
          {record.completed_at && ` · settled ${formatRelativeTime(record.completed_at)}`}
        </p>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 text-[11px]">
          <Field label="Account ID" value={record.user_id} mono />
          <Field label="Verification transaction ID" value={record.provider_transaction_id} mono />
          <Field label="Provider" value={record.provider} />
          <Field
            label="Verified attributes"
            value={
              [
                record.verified_name,
                record.verified_date_of_birth,
                record.verified_nationality,
                record.document_type,
                record.document_number_masked,
              ].filter(Boolean).join(" · ") || null
            }
          />
          <Field
            label="Verification method"
            value={record.methods.length ? record.methods.join(", ") : null}
          />
          <Field label="Provider attestation" value={record.provider_attestation} />
          <Field label="Report hash (SHA-256)" value={record.report_sha256} mono />
          <Field label="Report signature" value={record.report_signature} mono />
          <Field label="IP address" value={record.ip_address} mono />
          <Field label="Device / user agent" value={record.user_agent} />

          <div>
            <p className="font-semibold text-ink mb-1">Consent records</p>
            {record.consent_snapshot.length === 0 ? (
              <p className="text-faint">
                None captured — this account predates consent recording.
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {record.consent_snapshot.map((c, i) => (
                  <li key={i} className="text-muted">
                    {c.document} v{c.version} — {new Date(c.accepted_at).toLocaleString()}
                    {c.ip_address && ` from ${c.ip_address}`}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="font-semibold text-ink mb-1">Audit log</p>
            <ol className="flex flex-col gap-1">
              {record.audit_log.map((s, i) => (
                <li key={i} className="text-muted">
                  <span className="text-faint">{new Date(s.at).toLocaleString()}</span> —{" "}
                  <span className="font-semibold">{s.step}</span>
                  {s.actor && s.actor !== "system" && (
                    <span className="text-faint"> by {s.actor}</span>
                  )}
                  {s.detail && <span className="block text-faint">{s.detail}</span>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

// Renders "Not recorded" rather than hiding an empty field. The point of
// the log is to show what was and wasn't established — a silently missing
// row would read as though the question was never asked.
function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="font-semibold text-ink">{label}</p>
      {value ? (
        <p className={`text-muted break-all ${mono ? "font-mono text-[10px]" : ""}`}>{value}</p>
      ) : (
        <p className="text-faint italic">Not recorded</p>
      )}
    </div>
  );
}
