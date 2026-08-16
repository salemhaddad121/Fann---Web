"use client";

import { useEffect } from "react";
import {
  TWA_PARAM,
  TWA_PARAM_VALUE,
  TWA_FLAG,
  TWA_COOKIE_MAX_AGE_SECONDS,
  TWA_HTML_CLASS,
} from "@/lib/twa-context";

/**
 * Notices that this page load came from the Play app, and remembers it.
 *
 * Renders nothing. Mounted once in the root layout so it sees the very
 * first navigation, which is the only one carrying the marker.
 *
 * Reads window.location directly rather than useSearchParams, so the root
 * layout does not need a Suspense boundary and no route is pushed out of
 * static rendering by its presence.
 */
export function TwaContextProbe() {
  useEffect(() => {
    let inApp = false;
    try {
      inApp =
        new URLSearchParams(window.location.search).get(TWA_PARAM) === TWA_PARAM_VALUE ||
        window.sessionStorage.getItem(TWA_FLAG) === "1";
    } catch {
      // sessionStorage throws when storage is blocked. Nothing here is
      // important enough to break a page load over.
      return;
    }

    if (!inApp) return;

    document.documentElement.classList.add(TWA_HTML_CLASS);

    try {
      window.sessionStorage.setItem(TWA_FLAG, "1");
    } catch {
      // Cookie alone is enough.
    }

    // Rewritten on every launch so it keeps pace with the app being used,
    // and scoped to the whole site because the Custom Tab can re-enter at
    // any path.
    document.cookie = `${TWA_FLAG}=1; path=/; max-age=${TWA_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  }, []);

  return null;
}
