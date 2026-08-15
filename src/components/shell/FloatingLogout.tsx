"use client";

import { useAuth } from "@/lib/auth-context";

/**
 * Log out, for shells that have no sidebar.
 *
 * Logout normally lives at the foot of the desktop Sidebar. Admin has no
 * sidebar — ADMIN_NAV is empty on purpose, because the admin mockups show a
 * navbar and a scrollable list rather than a bottom nav — and TopNav only
 * links to /account, which has no logout either. The result was that an
 * admin could not sign out at all.
 *
 * Fixed bottom-right rather than added to the nav, so the deliberate
 * "admin has no nav items" decision stays intact.
 */
export function FloatingLogout() {
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={logout}
      // Above page content but below any modal or lightbox, which sit at
      // z-50 — a logout button floating over an open dialog would be worse
      // than one that is briefly covered.
      className="fixed bottom-5 right-5 z-30 flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-4 py-2.5 text-sm font-semibold text-ink shadow-lg transition-opacity hover:opacity-90"
    >
      <i className="ti ti-logout text-[17px]" aria-hidden />
      Log out
    </button>
  );
}
