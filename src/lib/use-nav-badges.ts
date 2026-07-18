"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { UserRole } from "@/types/auth";

interface ConversationRow {
  unreadCount?: number;
}

async function fetchBadgeCounts(role: UserRole | undefined) {
  // Admins aren't party to conversations, and the notifications table is
  // scoped to per-user rows for artists/planners in the current schema.
  if (role !== "artist" && role !== "planner") return null;

  try {
    const [notif, conversations] = await Promise.all([
      apiFetch<{ unreadCount: number }>("/notifications/unread-count"),
      apiFetch<ConversationRow[]>("/conversations"),
    ]);
    return {
      notifications: notif.unreadCount ?? 0,
      messages: conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
    };
  } catch {
    return null; // non-critical — badges just stay at their last known value
  }
}

const POLL_MS = 10000;

export function useNavBadges(role: UserRole | undefined) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let cancelled = false;

    function poll() {
      fetchBadgeCounts(role).then((counts) => {
        if (cancelled || !counts) return;
        setUnreadMessages(counts.messages);
        setUnreadNotifications(counts.notifications);
      });
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [role]);

  const refetch = useCallback(async () => {
    const counts = await fetchBadgeCounts(role);
    if (!counts) return;
    setUnreadMessages(counts.messages);
    setUnreadNotifications(counts.notifications);
  }, [role]);

  return { unreadMessages, unreadNotifications, refetch };
}
