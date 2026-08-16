// Minimal service worker for Fann.
//
// Caches STATIC assets only (JS, CSS, fonts, images, /seed/, /icons/,
// /backgrounds/) with a cache-first strategy. It NEVER touches the API or
// HTML documents: caching authenticated /api/v1 responses could serve one
// user's data to the next account on the same device, and a stale HTML
// document could show a logged-out shell. Those always hit the network.

// BUMP THIS whenever a cached asset changes at a URL that stays the same.
//
// Everything under /_next/static/ is content-hashed, so a new build gives it
// a new URL and the cache is irrelevant. The rest — /icons/, /backgrounds/,
// /seed/, favicon.ico — sits at a fixed path forever, and the fetch handler
// below is cache-first (`cached || fetch`), meaning it never revalidates. A
// visitor who has the old file keeps it indefinitely.
//
// The activate handler deletes every cache whose key is not this constant,
// so changing the value here is what actually evicts the old copies.
//
// v2 (2026-08-15): app icons and favicon regenerated from the Maqam mark.
// v3 (2026-08-16): offline fallback added — returning visitors need the new
//   worker for it to exist at all, and the shell has to be precached.
const CACHE = "fann-static-v3";

// Served in place of the browser's error page when a navigation cannot
// reach the network. Precached at install, because by the time it is needed
// there is no connection to fetch it with.
//
// This is a Play requirement as much as a nicety: a TWA showing Chrome's
// offline dinosaur fails the store's quality criteria.
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // reload bypasses the HTTP cache, so a stale copy of the shell is not
      // what gets stored for the life of this worker version.
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      // Never block activation on it. If the shell cannot be fetched at
      // install time, the worker should still install and keep serving
      // static assets — a missing fallback is better than no worker.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Same-origin only, and NEVER the API. (The API is a different origin
  // anyway, but guard the path too — belt and suspenders.)
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: always the network first, falling back to the offline
  // shell only when the request actually fails.
  //
  // Note this is network-FIRST, not cache-first like the static handler
  // below, and nothing but the shell is ever stored. Caching HTML would
  // risk serving a logged-out shell to a signed-in user, or one account's
  // page to the next person on the device — the reason the original worker
  // refused to touch documents at all. Serving a fixed, contentless
  // fallback page keeps that guarantee intact.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then(
          // If the shell somehow is not cached, let the browser show its own
          // error rather than resolving to undefined.
          (cached) => cached ?? Response.error(),
        ),
      ),
    );
    return;
  }

  // Static assets only — never HTML documents, so we can't stale-serve an
  // auth-gated page. Next.js build output lives under /_next/static/.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/seed/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/backgrounds/") ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|webp|gif|svg|ico)$/.test(url.pathname);
  if (!isStatic) return;

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
