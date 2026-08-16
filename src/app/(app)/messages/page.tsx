"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { listConversations, respondToRequest } from "@/lib/messaging-api";
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
  const [busyId, setBusyId] = useState<string | null>(null);

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

  async function respond(conversationId: string, decision: "accepted" | "declined") {
    setBusyId(conversationId);
    try {
      await respondToRequest(conversationId, decision);
      // Accepted threads move into the main list; declined ones are
      // filtered out server-side, so a reload settles both cases.
      const fresh = await listConversations();
      setConversations(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't respond to that request.");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!conversations) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  // A pending thread the *other* side opened is an incoming request. For a
  // planner that means an artist reached out; the artist who sent it sees
  // their own pending thread in the normal list instead, since there's
  // nothing for them to action.
  const isIncomingRequest = (c: ConversationSummary) =>
    c.status === "pending" && c.initiated_by !== user?.id;

  const requests = conversations.filter(isIncomingRequest);

  const filtered = conversations.filter((c) => {
    if (isIncomingRequest(c)) return false;
    if (filter === "unread" && c.unreadCount === 0) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (c.other_display_name ?? "").toLowerCase().includes(q) ||
      (c.last_message_body ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-lg lg:max-w-3xl mx-auto">
      <div className="px-4 pt-4 pb-3 border-b border-hairline">
        <h1 className="text-lg font-bold text-ink mb-3">Messages</h1>
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] border border-hairline bg-sand">
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
                ? `${user?.role === "planner" ? "bg-[#dfeceb] text-teal border-[#7fb3b0]" : "bg-sand text-clay border-[#e0a570]"} font-semibold`
                : "border-hairline text-muted"
            }`}
          >
            {f === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      {requests.length > 0 && (
        <div className="border-b border-hairline">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-faint px-4 pt-4 pb-2">
            Message requests
          </p>
          {requests.map((c) => {
            const name = c.other_display_name ?? "Unknown";
            return (
              <div key={c.id} className="px-4 pb-3.5">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-[46px] h-[46px] rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${badgeColor(name)}`}
                  >
                    {c.other_thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.other_thumbnail_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      initialsFromName(name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold text-ink truncate">{name}</span>
                    <p className="text-xs text-muted truncate">
                      {c.last_message_body ?? "Wants to message you"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(c.id, "declined")}
                    disabled={busyId === c.id}
                    className="flex-1 py-2 rounded-[10px] border border-hairline text-xs font-semibold text-muted disabled:opacity-60"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => respond(c.id, "accepted")}
                    disabled={busyId === c.id}
                    className="flex-1 py-2 rounded-[10px] bg-ink text-white text-xs font-semibold disabled:opacity-60"
                  >
                    Accept
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center text-center px-8 py-16">
          <div className="w-14 h-14 rounded-full bg-sand flex items-center justify-center text-xl text-faint mb-4">
            <i className="ti ti-message-circle" />
          </div>
          <p className="text-[15px] font-bold text-ink mb-1.5">No messages yet</p>
          <p className="text-[13px] text-muted leading-relaxed max-w-[260px]">
            Your conversations will appear here once you start messaging.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        /* Requests aren't conversations yet, so "no conversations" is the
           honest message even when the list above isn't empty. */
        <p className="px-4 py-10 text-sm text-muted text-center">
          {requests.length > 0 ? "No conversations yet." : "No conversations match."}
        </p>
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
                      {/* The sender's own outgoing request — they can't
                          action it, so flag the wait instead of a time. */}
                      {c.status === "pending"
                        ? "Pending"
                        : c.last_message_at
                          ? formatRelativeTime(c.last_message_at)
                          : ""}
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
                      user?.role === "planner" ? "bg-teal" : "bg-clay"
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
