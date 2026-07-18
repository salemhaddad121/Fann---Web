"use client";

import { useEffect, useState } from "react";
import { getAuditLog } from "@/lib/admin-api";
import { Pagination } from "@/components/admin/Pagination";
import { formatRelativeTime } from "@/lib/format";
import type { AuditLogEntry } from "@/types/admin";

export function AuditTab() {
  const [rows, setRows] = useState<AuditLogEntry[] | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAuditLog(page)
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setPages(res.meta.pages);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the audit log.");
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!rows) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  if (rows.length === 0) {
    return <p className="px-4 py-10 text-sm text-muted text-center">No admin actions yet.</p>;
  }

  return (
    <div>
      {rows.map((entry) => (
        <div key={entry.id} className="px-4 py-3 border-b border-hairline">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[13px] font-semibold text-ink">{entry.action}</span>
            <span className="text-[11px] text-faint shrink-0">{formatRelativeTime(entry.created_at)}</span>
          </div>
          <p className="text-xs text-muted">
            By {entry.admin_email} ({entry.admin_account_code}) · Target: {entry.target_id.slice(0, 8)}…
          </p>
          {entry.note && <p className="text-xs text-faint mt-0.5">{entry.note}</p>}
        </div>
      ))}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
