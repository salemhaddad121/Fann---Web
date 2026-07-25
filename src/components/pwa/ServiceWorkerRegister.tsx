"use client";

import { useEffect } from "react";

// Registers the static-asset service worker (public/sw.js) on the client.
// Renders nothing.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures are non-fatal — the app works without it.
      });
    }
  }, []);

  return null;
}
