"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { normalisePath, sendPageEvents, type PageEvent } from "@/lib/page-timing";

// Measures FOREGROUND time per route and reports it in batches.
//
// Foreground matters: without the Page Visibility API, a tab left open
// overnight would report eight hours of "engagement" and make the average
// meaningless. Time only accrues while the page is actually visible.
//
// Rendered inside AppShell, so it runs for logged-in users only — role is
// the whole point of the data and an anonymous row could not be attributed.
//
// Accuracy is best-effort by nature. A hard browser kill can lose the
// final segment, and sendBeacon delivery is not guaranteed. These numbers
// are a directional signal, not an audit trail.
export function PageTiming() {
  const pathname = usePathname();
  const queue = useRef<PageEvent[]>([]);
  // Accumulated visible time for the current route, plus when the current
  // visible stretch began. null means the page is currently hidden.
  const accumulated = useRef(0);
  const visibleSince = useRef<number | null>(null);
  const routeStarted = useRef<string>(new Date().toISOString());

  useEffect(() => {
    // New route: close out whatever the previous one accumulated.
    accumulated.current = 0;
    visibleSince.current = document.visibilityState === "visible" ? Date.now() : null;
    routeStarted.current = new Date().toISOString();

    const path = normalisePath(pathname);

    const settle = () => {
      if (visibleSince.current !== null) {
        accumulated.current += Date.now() - visibleSince.current;
        visibleSince.current = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (visibleSince.current === null) visibleSince.current = Date.now();
      } else {
        settle();
        // Hiding often precedes closing, so flush rather than risk losing it.
        flush();
      }
    };

    const flush = () => {
      settle();
      if (accumulated.current > 0) {
        queue.current.push({
          path,
          durationMs: accumulated.current,
          occurredAt: routeStarted.current,
        });
        accumulated.current = 0;
      }
      if (queue.current.length > 0) {
        sendPageEvents(queue.current);
        queue.current = [];
      }
      // Still here (hidden, not closed) — resume timing if we become visible.
      if (document.visibilityState === "visible") visibleSince.current = Date.now();
    };

    document.addEventListener("visibilitychange", onVisibility);
    // pagehide fires on iOS Safari where unload frequently does not.
    window.addEventListener("pagehide", flush);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      // Route change: bank this route's time and send it.
      flush();
    };
  }, [pathname]);

  return null;
}
