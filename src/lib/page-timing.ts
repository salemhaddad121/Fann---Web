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

export function sendPageEvents(events: PageEvent[]): void {
  if (events.length === 0) return;
  const body = JSON.stringify({ events });

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
  apiFetch("/analytics/page-views", { method: "POST", body: { events } }).catch(() => {});
}
