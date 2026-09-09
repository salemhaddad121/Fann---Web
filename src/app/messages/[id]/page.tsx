"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getConversation, getMessages, sendMessage, markRead } from "@/lib/messaging-api";
import type { Conversation } from "@/lib/messaging-api";
import { getUserPublicInfo, type PublicUserInfo } from "@/lib/users-api";
import { createBooking } from "@/lib/bookings-api";
import { ApiError } from "@/lib/api";
import { initialsFromName } from "@/lib/format";
import { badgeColor } from "@/lib/badge-colors";
import { MessageList } from "@/components/messaging/MessageList";
import { AppShell } from "@/components/shell/AppShell";
import { ProposeBookingForm } from "@/components/bookings/ProposeBookingForm";
import type { Message } from "@/types/messaging";

const POLL_MS = 4000;

export default function ThreadPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [otherParty, setOtherParty] = useState<PublicUserInfo | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [proposeNotice, setProposeNotice] = useState<string | null>(null);
  // Holds the server's own 402 message. The thread has no viewer_tier to
  // read from, so a paywall is only discoverable by trying something — and
  // there are now two different reasons for it. A lapsed plan and a spent
  // day pass both refuse with 402, but a spent pass has NOT ended, so
  // hardcoding "your plan has ended" would send that buyer to re-buy the
  // wrong thing. The API says which; this just shows it.
  const [planNotice, setPlanNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
  }, [isLoading, user, router]);

  // Resolve the other party: the raw conversation row only has
  // artist_id/planner_id (user ids, no names), so a second call to
  // GET /users/:id/public-info fills in the name/avatar/profile link —
  // no longer needs the whole conversations list just to find one row.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getConversation(conversationId)
      .then(async (conv) => {
        if (cancelled) return;
        setConversation(conv);
        const otherId = conv.artist_id === user.id ? conv.planner_id : conv.artist_id;
        const info = await getUserPublicInfo(otherId).catch(() => null);
        if (!cancelled) setOtherParty(info);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId, user]);

  useEffect(() => {
    let cancelled = false;

    function load() {
      getMessages(conversationId)
        .then((res) => {
          if (cancelled) return;
          setMessages(res.data.slice().reverse()); // API returns newest-first
        })
        .catch(() => {
          if (!cancelled) setNotFound(true);
        });
      markRead(conversationId).catch(() => {
        // Non-critical — worst case the unread badge lags a beat.
      });
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft("");
    try {
      const msg = await sendMessage(conversationId, body);
      setMessages((prev) => (prev ? [...prev, msg] : [msg]));
    } catch (err) {
      setDraft(body); // put it back so nothing typed is lost
      // A lapsed plan is not a failed send and must not be swallowed as
      // one: the composer looks untouched afterwards, so with nothing on
      // screen the message merely never appears and no reason is given.
      if (err instanceof ApiError && err.status === 402) setPlanNotice(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleProposeBooking(payload: {
    eventName: string;
    eventDate: string;
    eventLocation?: string;
    durationHours?: number;
    agreedFeeUsd?: number;
    notes?: string;
  }) {
    if (!conversation) return;
    try {
      await createBooking({ artistId: conversation.artist_id, conversationId, ...payload });
    } catch (err) {
      // Reported here rather than in the form's own banner: "your plan has
      // ended" belongs on the thread, where the way out stays on screen
      // after the sheet closes instead of vanishing with it.
      if (err instanceof ApiError && err.status === 402) {
        setProposeOpen(false);
        setPlanNotice(err.message);
        return;
      }
      throw err; // anything else is the form's to report
    }
    setProposeOpen(false);
    setProposeNotice("Booking request sent.");
    setTimeout(() => setProposeNotice(null), 3000);
  }

  if (isLoading || !user) return null;

  if (notFound) {
    return (
      <AppShell user={user} chrome="sidebar-only">
        <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center gap-3">
          <p className="text-sm text-danger">This conversation isn&apos;t available.</p>
          <Link href="/messages" className="text-sm font-semibold text-clay">
            ← Back to messages
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!conversation || !messages) {
    return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  }

  const isPlanner = user.role === "planner";
  const accent = isPlanner ? "bg-teal" : "bg-clay";
  const accentText = isPlanner ? "text-teal" : "text-clay";
  const name = otherParty?.displayName ?? "Unknown";
  const profileHref = otherParty?.profileId
    ? otherParty.role === "artist"
      ? `/artists/${otherParty.profileId}`
      : `/planners/${otherParty.profileId}`
    : null;

  return (
    // Stays outside the (app) route group on purpose: that group's layout
    // applies the full chrome, and this page must not get the mobile
    // BottomNav — the composer already owns the bottom of the screen. It
    // renders the shell itself instead, so it picks up the desktop sidebar
    // (and the backdrop) without the mobile bars.
    <AppShell user={user} chrome="sidebar-only">
      <div className="h-screen flex flex-col max-w-lg mx-auto bg-surface relative">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline shrink-0">
          <button onClick={() => router.push("/messages")} className="text-muted" aria-label="Back to messages">
            <i className="ti ti-arrow-left text-lg" />
          </button>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${badgeColor(name)}`}
          >
            {otherParty?.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={otherParty.thumbnailUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              initialsFromName(name)
            )}
          </div>
          <div className="flex-1 min-w-0">
            {profileHref ? (
              <Link href={profileHref} className="text-sm font-semibold text-ink truncate hover:underline">
                {name}
              </Link>
            ) : (
              <div className="text-sm font-semibold text-ink truncate">{name}</div>
            )}
          </div>
          {isPlanner && (
            <button
              onClick={() => setProposeOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-teal border border-[#7fb3b0] bg-[#dfeceb] px-2.5 py-1.5 rounded-lg shrink-0"
            >
              <i className="ti ti-calendar-plus text-sm" /> Propose booking
            </button>
          )}
        </div>

        {proposeNotice && (
          <div className="mx-4 mt-2 px-3.5 py-2 rounded-[10px] bg-ink text-white text-xs text-center shrink-0">
            {proposeNotice}{" "}
            <Link href="/bookings" className="underline font-semibold">
              View
            </Link>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center px-6 py-10">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white mb-3 ${accent}`}
              >
                {initialsFromName(name)}
              </div>
              <p className="text-sm font-bold text-ink mb-1">{name}</p>
              <p className="text-xs text-faint max-w-[240px] leading-relaxed">
                This is the start of your conversation. Introduce yourself and what you can offer.
              </p>
            </div>
          ) : (
            <MessageList messages={messages} currentUserId={user.id} accent={accent} accentText={accentText} />
          )}
        </div>

        {planNotice && (
          <div className="mx-3.5 mb-2 flex items-center justify-between gap-3 rounded-[10px] border border-hairline bg-sand px-3.5 py-2.5 shrink-0">
            <p className="text-xs leading-snug text-muted">{planNotice}</p>
            <Link
              href="/plans"
              className="shrink-0 rounded-lg bg-clay-deep px-3 py-1.5 text-xs font-semibold text-white"
            >
              See plans
            </Link>
          </div>
        )}

        <div className="flex items-end gap-2 px-3.5 py-2.5 border-t border-hairline shrink-0">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Write a message…"
            className="flex-1 resize-none rounded-3xl border border-hairline bg-sand px-4 py-2.5 text-sm outline-none focus:border-clay max-h-20"
          />
          <button
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-50 ${accent}`}
            aria-label="Send message"
          >
            <i className="ti ti-send text-base" />
          </button>
        </div>

        {proposeOpen && (
          <ProposeBookingForm onCancel={() => setProposeOpen(false)} onSubmit={handleProposeBooking} />
        )}
      </div>
    </AppShell>
  );
}
