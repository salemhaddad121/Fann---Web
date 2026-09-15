/**
 * A client-side hint that this browser has had a session at some point.
 *
 * The problem it solves: sessions live in httpOnly cookies, so JavaScript
 * cannot tell whether one exists. Every page load therefore asked
 * GET /auth/me, got a 401 for a signed-out visitor, and apiFetch dutifully
 * tried POST /auth/refresh — which 401s too, because there was never a
 * refresh cookie to rotate. Two requests and two console errors on every
 * public page, for a visitor who has never logged in.
 *
 * It also cost real headroom: /auth/refresh is rate limited to 30/min per
 * IP, and a guest browsing quickly was spending that budget on calls that
 * could not succeed.
 *
 * The hint is a local flag, not a cookie: it never needs to reach the
 * server, so sending it on every request would be waste of a different
 * kind. It is deliberately NOT a security control — it can only cause a
 * refresh to be skipped, never a request to be authorised, so a tampered
 * value costs the tamperer a login and nothing else.
 *
 * Reads and writes are wrapped because localStorage throws outright in some
 * privacy modes. Failing closed there means "no hint" — one wasted refresh,
 * which is exactly today's behaviour.
 */

const KEY = "fann.session-hint";

/** Call after anything that proves a session exists. */
export function markSessionLikely(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // Private mode, or storage disabled. The cost is a refresh attempt we
    // could have skipped, which is what happened before this existed.
  }
}

/** Call on logout, and when a refresh has proven there is nothing to renew. */
export function clearSessionHint(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // As above.
  }
}

/**
 * Whether attempting a token refresh could plausibly succeed.
 *
 * Returns true on the server and whenever storage is unreadable, so the
 * refresh still runs. The optimisation is worth having only where it is
 * safe; "unsure" must always mean "try", or a real user gets signed out.
 */
export function sessionMayExist(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}
