"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { listConversations } from "@/lib/messaging-api";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { badgeColor } from "@/lib/badge-colors";
import type { ConversationSummary } from "@/types/messaging";

const POLL_MS = 10000;

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    let cancelled = false;

    function load() {
      listConversations()
        .then((data) => {
          if (!cancelled) setConversations(data);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Couldn't load your messages.");
          }
        });
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!conversations) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  const filtered = conversations.filter((c) => {
    if (filter === "unread" && c.unreadCount === 0) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (c.other_display_name ?? "").toLowerCase().includes(q) ||
      (c.last_message_body ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-4 pb-3 border-b border-hairline">
        <h1 className="text-lg font-bold text-ink mb-3">Messages</h1>
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] border border-hairline bg-mist">
          <i className="ti ti-search text-faint text-base" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-faint"
          />
        </div>
      </div>

      <div className="flex gap-1.5 px-4 py-3 border-b border-hairline">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-2xl text-xs border ${
              filter === f
                ? `${user?.role === "planner" ? "bg-[#E0F2FE] text-sky border-[#38BDF8]" : "bg-mist text-indigo border-[#93ADE8]"} font-semibold`
                : "border-hairline text-muted"
            }`}
          >
            {f === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center text-center px-8 py-16">
          <div className="w-14 h-14 rounded-full bg-mist flex items-center justify-center text-xl text-faint mb-4">
            <i className="ti ti-message-circle" />
          </div>
          <p className="text-[15px] font-bold text-ink mb-1.5">No messages yet</p>
          <p className="text-[13px] text-muted leading-relaxed max-w-[260px]">
            Your conversations will appear here once you start messaging.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-4 py-10 text-sm text-muted text-center">No conversations match.</p>
      ) : (
        <div>
          {filtered.map((c) => {
            const name = c.other_display_name ?? "Unknown";
            const unread = c.unreadCount > 0;
            return (
              <button
                key={c.id}
                onClick={() => router.push(`/messages/${c.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-hairline text-left"
              >
                <div
                  className={`relative w-[46px] h-[46px] rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${badgeColor(name)}`}
                >
                  {c.other_thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.other_thumbnail_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    initialsFromName(name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-ink truncate">{name}</span>
                    <span className="text-[11px] text-faint shrink-0">
                      {c.last_message_at ? formatRelativeTime(c.last_message_at) : ""}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${unread ? "font-semibold text-ink" : "text-muted"}`}
                  >
                    {c.last_message_body ?? "No messages yet"}
                  </p>
                </div>
                {unread && (
                  <span
                    className={`min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-semibold flex items-center justify-center px-1 shrink-0 ${
                      user?.role === "planner" ? "bg-sky" : "bg-indigo"
                    }`}
                  >
                    {c.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
