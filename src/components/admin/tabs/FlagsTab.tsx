"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOpenFlags, resolveFlag } from "@/lib/admin-api";
import { usePublicInfoMap } from "@/lib/use-public-info-map";
import { Pagination } from "@/components/admin/Pagination";
import { formatRelativeTime } from "@/lib/format";
import type { AdminFlag } from "@/types/admin";

const TARGET_LABELS: Record<string, string> = {
  profile: "Profile",
  message: "Message",
  conversation: "Conversation",
};

export function FlagsTab() {
  const [rows, setRows] = useState<AdminFlag[] | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For "profile"-type flags, target_id IS the user id (see
  // getPublicInfo() in the backend's users.service.ts) — resolve those
  // through the same directory hook bookings/messages already use, so we
  // can link straight to the profile instead of showing a bare id.
  // "message"/"conversation" flags stay as plain labeled ids below —
  // there's no single obvious profile to send someone to for those.
  const profileTargetIds = (rows ?? [])
    .filter((f) => f.target_type === "profile")
    .map((f) => f.target_id);
  const directory = usePublicInfoMap(profileTargetIds);

  useEffect(() => {
    let cancelled = false;
    listOpenFlags(page)
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setPages(res.meta.pages);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load open flags.");
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  async function handleResolve(id: string, decision: "dismissed" | "actioned") {
    setBusyId(id);
    try {
      await resolveFlag(id, decision);
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resolve that flag.");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!rows) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  if (rows.length === 0) {
    return <p className="px-4 py-10 text-sm text-muted text-center">No open flags.</p>;
  }

  return (
    <div>
      {rows.map((f) => (
        <div key={f.id} className="px-4 py-3.5 border-b border-hairline">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-sand text-muted">
              {TARGET_LABELS[f.target_type] ?? f.target_type}
            </span>
            <span className="text-[11px] text-faint">{formatRelativeTime(f.created_at)}</span>
          </div>
          <p className="text-sm text-ink mb-1.5">{f.reason}</p>
          <p className="text-[11px] text-faint mb-2.5">
            Reported by {f.reporter_email} ({f.reporter_account_code}) ·{" "}
            {f.target_type === "profile" && directory[f.target_id]?.profileId ? (
              <>
                Target:{" "}
                <Link
                  href={
                    directory[f.target_id].role === "planner"
                      ? `/planners/${directory[f.target_id].profileId}`
                      : `/artists/${directory[f.target_id].profileId}`
                  }
                  className="font-semibold text-clay"
                >
                  {directory[f.target_id].displayName ?? "View profile"}
                </Link>
              </>
            ) : (
              <>
                Target ID: <span className="font-mono">{f.target_id.slice(0, 8)}…</span>
              </>
            )}
          </p>
          <div className="flex gap-2">
            <button
              disabled={busyId === f.id}
              onClick={() => handleResolve(f.id, "actioned")}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FEF2F2] text-[#7F1D1D] border border-[#FCA5A5] disabled:opacity-50"
            >
              Take action
            </button>
            <button
              disabled={busyId === f.id}
              onClick={() => handleResolve(f.id, "dismissed")}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sand text-muted border border-hairline disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
