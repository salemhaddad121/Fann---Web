"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { homePathFor } from "@/lib/nav-config";
import type { UserRole } from "@/types/auth";

/**
 * Keeps a role-specific page to that role, by URL as well as by nav.
 *
 * nav-config.ts already scopes the links, so a planner is never SHOWN
 * /verification or /calendar — but typing either, or following a stale
 * link from a search result or an old email, landed on the page and
 * returned 200. Both pages did check the role and render an explanation
 * rather than artist content, so nothing leaked; what they did not do was
 * stop being a planner's page.
 *
 * Redirects to the role's own home rather than showing a dead end, which
 * is what M11 asks for. `replace`, not `push`: the page the user cannot
 * use should not be the thing Back returns them to.
 *
 * Returns the same shape as useRequireAuth so a page can do one destructure
 * and one `if (!ready) return null`.
 */
export function useRequireRole(allowed: UserRole | UserRole[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const roles = Array.isArray(allowed) ? allowed : [allowed];
  const allowedForUser = user ? roles.includes(user.role) : false;

  useEffect(() => {
    if (isLoading || !user) return;
    // Signed out is the layout's job, not this hook's — it redirects to
    // /auth/login, and racing it here would send the user somewhere else
    // for a reason that has nothing to do with their role.
    if (!roles.includes(user.role)) router.replace(homePathFor(user.role));
    // roles is rebuilt each render; depending on user.role is what actually
    // decides, and keeps this from firing on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user, user?.role, router]);

  return {
    user,
    isLoading,
    /** True once there is a user AND they are allowed to be here. */
    ready: !isLoading && !!user && allowedForUser,
  };
}
