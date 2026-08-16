"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications-api";
import { notificationStyle } from "@/lib/notification-style";
import { formatRelativeTime } from "@/lib/format";
import type { NotificationRow } from "@/types/notifications";

const POLL_MS = 15000;

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function load() {
      listNotifications({ page })
        .then((res) => {
          if (cancelled) return;
          setNotifications(res.data);
          setPages(res.meta.pages);
        })
        .catch(() => {
          if (!cancelled) setError("Couldn't load notifications.");
        });
    }

    load();
    const interval = page === 1 ? setInterval(load, POLL_MS) : undefined;
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [page]);

  async function handleOpen(n: NotificationRow) {
    if (!n.read_at) {
      setNotifications((prev) =>
        prev ? prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)) : prev,
      );
      markNotificationRead(n.id).catch(() => {
        // Non-critical — worst case it shows unread again on next poll.
      });
    }
    if (n.data?.conversation_id) {
      router.push(`/messages/${n.data.conversation_id}`);
    } else if (n.data?.booking_id) {
      router.push(`/bookings/${n.data.booking_id}`);
    }
    // Account/ID/payment notifications are informational only — there's no
    // dedicated detail page for them yet, so opening one just marks it read.
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev ? prev.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })) : prev,
      );
    } finally {
      setMarkingAll(false);
    }
  }

  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!notifications) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  const hasUnread = notifications.some((n) => !n.read_at);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center text-center px-8 py-16">
        <div className="w-14 h-14 rounded-full bg-sand flex items-center justify-center text-xl text-faint mb-4">
          <i className="ti ti-bell" />
        </div>
        <p className="text-[15px] font-bold text-ink mb-1.5">No notifications yet</p>
        <p className="text-[13px] text-muted leading-relaxed max-w-[260px]">
          Booking requests, responses, and review reminders will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg lg:max-w-3xl mx-auto pb-8">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-ink">Notifications</h1>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-xs font-semibold text-clay disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex flex-col">
        {notifications.map((n) => {
          const style = notificationStyle(n.type);
          const unread = !n.read_at;
          return (
            <button
              key={n.id}
              onClick={() => handleOpen(n)}
              className="flex items-start gap-3 px-4 py-3.5 border-b border-hairline text-left"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.fg}`}>
                <i className={`ti ${style.icon} text-base`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[13px] ${unread ? "font-bold text-ink" : "font-semibold text-ink"}`}>
                    {n.title}
                  </span>
                  <span className="text-[11px] text-faint shrink-0">{formatRelativeTime(n.created_at)}</span>
                </div>
                {(n.data?.event_name || n.data?.note || n.data?.rejection_reason) && (
                  <p className="text-xs text-muted truncate mt-0.5">
                    {n.data?.event_name ?? n.data?.rejection_reason ?? n.data?.note}
                  </p>
                )}
              </div>
              {unread && <span className="w-2 h-2 rounded-full bg-clay shrink-0 mt-1.5" />}
            </button>
          );
        })}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-faint">
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-[10px] border border-hairline text-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
