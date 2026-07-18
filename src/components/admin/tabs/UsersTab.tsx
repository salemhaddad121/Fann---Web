"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listAdminUsers, updateAdminUserStatus } from "@/lib/admin-api";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { Pagination } from "@/components/admin/Pagination";
import { initialsFromName } from "@/lib/format";
import { badgeColor } from "@/lib/badge-colors";
import type { AdminUserRow, UserStatus } from "@/types/admin";

const ROLE_OPTIONS = ["", "artist", "planner", "admin"] as const;
const STATUS_OPTIONS = ["", "pending_review", "active", "suspended", "banned"] as const;

export function UsersTab() {
  const [rows, setRows] = useState<AdminUserRow[] | null>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [busyId, setBusyId] = useState<string | null>(null);
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

  async function handleStatus(userId: string, next: UserStatus) {
    setBusyId(userId);
    try {
      await updateAdminUserStatus(userId, next);
      setRows((prev) => (prev ? prev.map((r) => (r.id === userId ? { ...r, status: next } : r)) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update that user.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="p-4 flex flex-col gap-2.5 border-b border-hairline">
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] border border-hairline bg-mist">
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
            className="flex-1 rounded-[10px] border border-hairline px-2.5 py-2 text-xs bg-white"
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
            className="flex-1 rounded-[10px] border border-hairline px-2.5 py-2 text-xs bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s ? s.replace("_", " ") : "All statuses"}
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
                      {u.is_verified && <i className="ti ti-rosette-discount-check text-indigo text-xs" />}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {u.role[0].toUpperCase() + u.role.slice(1)} · {u.account_code} · Joined{" "}
                      {new Date(u.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </Link>
                <UserStatusBadge status={u.status} deletedAt={u.deleted_at} />
                <div className="flex gap-1.5 shrink-0">
                  {u.status === "pending_review" && (
                    <>
                      <button
                        disabled={busyId === u.id}
                        onClick={() => handleStatus(u.id, "active")}
                        className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={busyId === u.id}
                        onClick={() => handleStatus(u.id, "banned")}
                        className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#FEF2F2] text-[#7F1D1D] border border-[#FCA5A5] disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {u.status === "active" && u.role !== "admin" && (
                    <button
                      disabled={busyId === u.id}
                      onClick={() => handleStatus(u.id, "suspended")}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] disabled:opacity-50"
                    >
                      Suspend
                    </button>
                  )}
                  {u.status === "suspended" && (
                    <button
                      disabled={busyId === u.id}
                      onClick={() => handleStatus(u.id, "active")}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] disabled:opacity-50"
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
