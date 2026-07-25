// Minimal service worker for Fann.
//
// Caches STATIC assets only (JS, CSS, fonts, images, /seed/, /icons/,
// /backgrounds/) with a cache-first strategy. It NEVER touches the API or
// HTML documents: caching authenticated /api/v1 responses could serve one
// user's data to the next account on the same device, and a stale HTML
// document could show a logged-out shell. Those always hit the network.

const CACHE = "fann-static-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
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
