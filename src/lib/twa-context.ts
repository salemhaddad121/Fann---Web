/**
 * Detecting that the site is being viewed inside the Play app.
 *
 * A Trusted Web Activity *is* this website, loaded in a Chrome Custom Tab.
 * There is no second codebase to hide pricing in, so the site has to know
 * when it is the app and behave differently — Play's billing policy governs
 * purchases made in an app, and the safe position is that the app never
 * shows a price, a plan or a way to pay.
 *
 * ⚠️ The marker is set by the TWA's own start URL, configured in
 * twa-manifest.json when the bundle is built — NOT by start_url in
 * public/manifest.json. The handoff specifies the web manifest, but that
 * file is shared with the browser's own install prompt: putting ?src=twa
 * there would mark every desktop and mobile PWA install as the app too, and
 * suppress pricing for people who reached it straight from the website.
 * Bubblewrap takes a startUrl of its own, which is the right place for it.
 */

/** Query parameter on the app's start URL. */
export const TWA_PARAM = "src";
export const TWA_PARAM_VALUE = "twa";

/**
 * Where the flag is remembered.
 *
 * Both, deliberately. sessionStorage survives client-side navigation; the
 * cookie is what lets the server know, which is how /plans can render the
 * explainer instead of the pricing rather than flashing prices and then
 * replacing them. A Custom Tab can also re-enter at a different path with
 * no query string at all, and the cookie survives that where the marker
 * would not.
 *
 * Not httpOnly and not a security boundary — it decides a display mode, and
 * a user who forges it only hides pricing from themselves.
 */
export const TWA_FLAG = "fann_twa";

/** A session-length cookie: the app sets it again on every launch. */
export const TWA_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Class placed on <html> so CSS can suppress pricing without prop drilling. */
export const TWA_HTML_CLASS = "is-twa";
