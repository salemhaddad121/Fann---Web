import { apiFetch } from "@/lib/api";

export interface PageEvent {
  path: string;
  durationMs: number;
  occurredAt: string;
}

// Dynamic segments are collapsed so the table holds routes, not ids.
// '/artists/<uuid>' becomes '/artists/[id]'. This is both a cardinality
// guard and a privacy one: "a booker viewed an artist page" is a far less
// sensitive record than which specific artist they looked at.
const DYNAMIC_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^\d+$/i;

export function normalisePath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  return (
    "/" +
    parts.map((p) => (DYNAMIC_SEGMENT.test(p) ? "[id]" : p)).join("/")
  );
}

const SESSION_STORAGE_KEY = "fann_session_id";

/**
 * A per-tab id used to group page views into a session.
 *
 * sessionStorage, not localStorage and not a cookie. It dies when the tab
 * closes, is never sent automatically with requests, and is never joined to
 * an account — which is what makes recording signed-out visitors defensible
 * without a consent banner. Anything more persistent would be tracking.
 *
 * Returns null during server rendering, where there is no session to speak
 * of yet; the events simply go up without one.
 */
export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    // randomUUID needs a secure context, which localhost counts as, but a
    // LAN IP over plain http does not — so a dev on a phone would hit the
    // fallback rather than an exception.
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : fallbackUuid();

    window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    // Private browsing modes can throw on sessionStorage access. Telemetry
    // is not worth breaking a page over.
    return null;
  }
}

function fallbackUuid(): string {
  // v4 shape, from Math.random. Good enough to group one tab's page views;
  // nothing here depends on it being unguessable.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function sendPageEvents(events: PageEvent[]): void {
  if (events.length === 0) return;
  const sessionId = getSessionId();
  const payload = sessionId ? { events, sessionId } : { events };
  const body = JSON.stringify(payload);

  // sendBeacon survives the page being torn down, which a fetch generally
  // does not — this is the only way the final view of a session gets
  // recorded. It cannot set headers, but the endpoint authenticates from
  // the httpOnly cookie, which the browser attaches anyway.
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"}/analytics/page-views`;
    const ok = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    if (ok) return;
  }

  // Fallback for the non-unload case. Deliberately swallowed: telemetry
  // must never surface an error to someone using the app.
  //
  // auth:false stops a 401 here from triggering a token refresh — a guest
  // has nothing to refresh, and the endpoint accepts anonymous events.
  apiFetch("/analytics/page-views", { method: "POST", body: payload, auth: false }).catch(
    () => {},
  );
}
