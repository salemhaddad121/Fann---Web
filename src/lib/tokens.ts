// NOTE on this choice, for future-me / Salem:
// The API returns accessToken + refreshToken as plain JSON (see
// auth.service.ts login()), not as cookies. To keep the mental model
// simple while learning, both tokens are kept in localStorage here.
//
// Trade-off: this is simple and works everywhere, but a malicious
// script running on the page (XSS) could read localStorage. A more
// locked-down setup moves the refresh token into an httpOnly cookie
// that JavaScript can never read — that requires a small backend
// change (auth.controller.ts setting a cookie instead of returning
// refreshToken in the body). Worth doing before real production
// launch; fine to defer while building features.

const ACCESS_TOKEN_KEY = "aynu.accessToken";
const REFRESH_TOKEN_KEY = "aynu.refreshToken";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
