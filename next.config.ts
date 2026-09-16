import type { NextConfig } from "next";

/**
 * Security headers, applied to every response.
 *
 * Measured on www.fann.guru before this existed: no CSP, no
 * X-Frame-Options, no X-Content-Type-Options, no Referrer-Policy, no
 * Permissions-Policy. The only one present was Strict-Transport-Security,
 * which Vercel adds on its own. next.config.ts was an empty object, so the
 * pages that carry the session cookie had nothing at all — and the site was
 * framable as it stood, which is a clickjacking surface on every
 * authenticated action in the product.
 *
 * The API already applies helmet(). This is the other half.
 */
const SECURITY_HEADERS = [
  {
    // Nothing embeds Fann, and the alternative is a transparent iframe over
    // a real page collecting real clicks — on a product whose logged-in
    // pages include "delete my account" and "confirm this payment".
    //
    // Kept alongside frame-ancestors rather than replaced by it: a CSP is
    // not in place yet (see below), and X-Frame-Options is what every
    // browser honours in the meantime.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Stops a browser guessing that a user-uploaded file is HTML and
    // executing it. Media is served from the CDN rather than from here, but
    // this costs nothing and the guarantee should not depend on that
    // staying true.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Full URL to our own origin, origin only to other HTTPS sites, nothing
    // at all on a downgrade to HTTP. Search URLs carry what someone is
    // looking for and profile URLs carry an artist id; neither should
    // travel to a third party in a Referer header.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // An empty allowlist denies the feature to this page AND to anything it
    // embeds. Nothing in the app calls getUserMedia or geolocation —
    // checked, including the ID and selfie upload, which is a plain file
    // input — so denying them takes nothing away and means a future script
    // cannot quietly start asking.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // L1 — the default advertises the framework and its major version, which
  // is free reconnaissance and buys nothing.
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Everything, including the API routes and static assets served
        // from this origin.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

/**
 * NO Content-Security-Policy yet, and that is deliberate rather than
 * forgotten.
 *
 * Next injects inline bootstrap and hydration scripts into every page.
 * Under a real `script-src 'self'` those are blocked and the app does not
 * run at all — the fix is per-request nonces, which means middleware, which
 * means every page becomes dynamically rendered. That is a performance
 * decision and a correctness risk that deserves its own change with its own
 * verification, not a line added to a headers batch.
 *
 * The audit says the same: "Add a CSP once the inline-script surface is
 * known." The four headers above are the part that is safe to ship today.
 */

export default nextConfig;
