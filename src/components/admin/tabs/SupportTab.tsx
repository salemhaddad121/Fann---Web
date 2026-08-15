"use client";

import { useEffect, useState } from "react";
import { Pagination } from "@/components/admin/Pagination";
import {
  getSupportTicket,
  listSupportTickets,
  updateSupportTicket,
} from "@/lib/support-api";
import {
  STATUS_LABELS,
  type SupportTicket,
  type SupportTicketDetail,
  type SupportTicketStatus,
} from "@/types/support";

const STATUS_FILTERS: (SupportTicketStatus | "all")[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "all",
];

const STATUS_STYLES: Record<SupportTicketStatus, string> = {
  open: "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]",
  in_progress: "bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]",
  resolved: "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]",
  closed: "bg-surface text-muted border-hairline",
};

function requesterOf(ticket: SupportTicket): string {
  // Exactly one of these is set — the database CHECK guarantees it.
  return ticket.user_email ?? ticket.guest_email ?? "unknown";
}

function TicketThread({
  ticket,
  onChanged,
}: {
  ticket: SupportTicketDetail;
  onChanged: (next: SupportTicketDetail) => void;
}) {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply(patch: { status?: SupportTicketStatus; reply?: string }) {
    setBusy(true);
    setError(null);
    try {
      onChanged(await updateSupportTicket(ticket.id, patch));
      if (patch.reply) setReply("");
    } catch {
      setError("Couldn't update that ticket.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-[10px] border border-hairline bg-paper/60 p-3">
      {error && <p className="mb-2 text-xs text-danger">{error}</p>}

      <div className="space-y-2">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg px-3 py-2 text-sm ${
              m.is_staff ? "bg-sand text-ink" : "bg-surface text-ink-soft"
            }`}
          >
            <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
              {m.is_staff ? (m.author_email ?? "Fann") : requesterOf(ticket)}
            </p>
            <p className="whitespace-pre-line">{m.body}</p>
          </div>
        ))}
      </div>

      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={3}
        placeholder="Write a reply — it's emailed to them."
        className="mt-3 w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-clay"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !reply.trim()}
          onClick={() => apply({ reply: reply.trim() })}
          className="rounded-lg bg-clay-deep px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send reply"}
        </button>

        {/* Status moves are separate from replying: plenty of tickets are
            resolved by a reply, and plenty are closed without one. */}
        {(["in_progress", "resolved", "closed", "open"] as SupportTicketStatus[])
          .filter((s) => s !== ticket.status)
          .map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy}
              onClick={() => apply({ status: s })}
              className="rounded-lg border border-hairline px-3 py-1.5 text-xs font-semibold text-muted disabled:opacity-50"
            >
              Mark {STATUS_LABELS[s].toLowerCase()}
            </button>
          ))}
      </div>
    </div>
  );
}

export function SupportTab() {
  const [rows, setRows] = useState<SupportTicket[] | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState<SupportTicketStatus | "all">("open");
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportTicketDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSupportTickets(page, status === "all" ? undefined : status)
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setPages(res.meta.pages);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load support tickets.");
      });
    return () => {
      cancelled = true;
    };
  }, [page, status]);

  async function toggle(id: string) {
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(id);
    setDetail(null);
    try {
      setDetail(await getSupportTicket(id));
    } catch {
      setError("Couldn't load that ticket.");
    }
  }

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!rows) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 px-4 py-3">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`rounded-2xl border px-3 py-1 text-xs font-semibold ${
              status === s ? "border-[#e0a570] bg-sand text-clay" : "border-hairline text-muted"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted">
          No {status === "all" ? "" : STATUS_LABELS[status].toLowerCase()} tickets.
        </p>
      ) : (
        rows.map((t) => (
          <div key={t.id} className="border-b border-hairline px-4 py-3.5">
            <button
              type="button"
              onClick={() => toggle(t.id)}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">{t.subject}</p>
                <p className="truncate text-xs text-muted">
                  {requesterOf(t)}
                  {t.user_role ? ` · ${t.user_role}` : " · guest"}
                  {t.source_path && ` · from ${t.source_path}`}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[t.status]}`}
                >
                  {STATUS_LABELS[t.status]}
                </span>
                <p className="mt-1 text-[11px] text-faint">
                  {new Date(t.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </button>

            {openId === t.id &&
              (detail ? (
                <TicketThread
                  ticket={detail}
                  onChanged={(next) => {
                    setDetail(next);
                    setRows((prev) =>
                      prev ? prev.map((r) => (r.id === next.id ? { ...r, status: next.status } : r)) : prev,
                    );
                  }}
                />
              ) : (
                <p className="mt-3 text-xs text-muted">Loading thread…</p>
              ))}
          </div>
        ))
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
