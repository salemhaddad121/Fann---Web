"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listAdminUsers } from "@/lib/admin-api";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { Pagination } from "@/components/admin/Pagination";
import { initialsFromName } from "@/lib/format";
import { badgeColor } from "@/lib/badge-colors";
import type { AdminUserRow } from "@/types/admin";

const ROLE_OPTIONS = ["", "artist", "planner", "admin"] as const;

// Value is what the API filters on; label is what the admin reads. 'banned'
// shows as "Rejected" (see UserStatusBadge) and 'deleted' is a pseudo-status
// the API maps onto deleted_at rather than users.status.
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "pending_review", label: "Pending" },
  { value: "banned", label: "Rejected" },
  { value: "deleted", label: "Deleted" },
] as const;

export function UsersTab() {
  const [rows, setRows] = useState<AdminUserRow[] | null>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAdminUsers({ q: q || undefined, role: role || undefined, status: status || undefined, page })
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setPages(res.meta.pages);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load users.");
      });
    return () => {
      cancelled = true;
    };
  }, [q, role, status, page]);

  return (
    <div>
      <div className="p-4 flex flex-col gap-2.5 border-b border-hairline">
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] border border-hairline bg-sand">
          <i className="ti ti-search text-faint text-base" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or account code…"
            className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-faint"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="flex-1 rounded-[10px] border border-hairline px-2.5 py-2 text-xs bg-surface"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r ? r[0].toUpperCase() + r.slice(1) : "All roles"}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="flex-1 rounded-[10px] border border-hairline px-2.5 py-2 text-xs bg-surface"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="px-4 py-3 text-sm text-danger">{error}</p>}
      {!rows ? (
        <p className="px-4 py-10 text-sm text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="px-4 py-10 text-sm text-muted text-center">No users match.</p>
      ) : (
        <div>
          {rows.map((u) => {
            const name = u.display_name ?? u.email;
            return (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-hairline">
                <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${badgeColor(name)}`}>
                    {initialsFromName(name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-ink truncate">{name}</span>
                      {u.is_verified && <i className="ti ti-rosette-discount-check text-clay text-xs" />}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {u.role[0].toUpperCase() + u.role.slice(1)} · {u.account_code} · Joined{" "}
                      {new Date(u.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </Link>
                {/* Status only — not a control. Approve/reject/suspend and
                    everything else now live on the user's detail page, so
                    there is one place to act and no duplicated toggles. */}
                <UserStatusBadge status={u.status} deletedAt={u.deleted_at} />
                <i className="ti ti-chevron-right text-faint text-sm shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
