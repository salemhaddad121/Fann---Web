"use client";

import { useAuth } from "@/lib/auth-context";

/**
 * Log out, for shells where the sidebar is not on screen.
 *
 * Logout lives at the foot of the desktop Sidebar, and that sidebar is
 * `lg:`-only. Two groups were left with no way out:
 *
 *  - admin, which has no sidebar at any width (ADMIN_NAV is empty on
 *    purpose — the admin mockups show a navbar and a scrollable list rather
 *    than a bottom nav), and whose TopNav only links to /account
 *  - every artist and planner on a phone, which is the product's primary
 *    surface. At 390px exactly one "Log out" node existed in the DOM on
 *    /dashboard, /account, /profile and /search, and it reported
 *    visible:false on all of them
 *
 * `placement` is a fixed pair of values rather than a className, because
 * the two positions differ in a property Tailwind resolves by stylesheet
 * order and not by the order classes appear in the attribute — passing
 * "bottom-24" to override "bottom-5" would work or not depending on how the
 * classes happened to be emitted.
 */
export function FloatingLogout({
  placement = "corner",
}: {
  /**
   * "corner"    — bottom-right at every width. For shells with no bottom
   *               nav to collide with.
   * "above-nav" — clears the mobile BottomNav, and hides itself at lg+
   *               where the sidebar's own logout takes over.
   */
  placement?: "corner" | "above-nav";
} = {}) {
  const { logout } = useAuth();

  const position =
    placement === "above-nav"
      ? "bottom-24 right-4 lg:hidden"
      : "bottom-5 right-5";

  return (
    <button
      type="button"
      onClick={logout}
      // Above page content but below any modal or lightbox, which sit at
      // z-50 — a logout button floating over an open dialog would be worse
      // than one that is briefly covered.
      className={`fixed ${position} z-30 flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-4 py-2.5 text-sm font-semibold text-ink shadow-lg transition-opacity hover:opacity-90`}
    >
      <i className="ti ti-logout text-[17px]" aria-hidden />
      Log out
    </button>
  );
}
