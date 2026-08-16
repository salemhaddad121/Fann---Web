"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { homePathFor } from "@/lib/nav-config";

/**
 * Sends a signed-in visitor from the landing page to their own home.
 *
 * This exists so the landing page itself does not have to be a client
 * component. It used to hold the session check directly, which meant the
 * whole marketing page rendered nothing at all — `return null` — until the
 * session probe came back. A crawler got an empty document, on the one page
 * whose entire job is to be found.
 *
 * Renders nothing. The trade is that a signed-in visitor sees the landing
 * page for the moment before the redirect fires, where they previously saw a
 * blank screen for the moment before it fired. Neither is good; only one of
 * them is also invisible to Google.
 */
export function RedirectIfAuthed() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    router.replace(homePathFor(user.role));
  }, [isLoading, user, router]);

  return null;
}
