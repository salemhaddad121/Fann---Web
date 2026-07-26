"use client";

import { useEffect } from "react";

// Registers the static-asset service worker (public/sw.js) on the client.
// Renders nothing.
//
// Production only, deliberately. sw.js caches /_next/static/ cache-first.
// In a production build that is safe because Next content-hashes those
// filenames, so a new build produces new URLs. In development Turbopack
// reuses stable chunk names across rebuilds, so cache-first pins the very
// first version of every chunk and no code change ever reaches the browser
// again — edits appear to do nothing, with no error anywhere to explain it.
//
// It also actively unregisters and clears, so a developer who already has
// the worker installed from an earlier run recovers automatically instead
// of debugging phantom staleness.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((r) => r.unregister());
        })
        .catch(() => {
          // Best effort — nothing here should break local dev.
        });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures are non-fatal — the app works without it.
    });
  }, []);

  return null;
}
