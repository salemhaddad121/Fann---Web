"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

// Browsing the marketplace is members-only: search results and artist/booker
// profiles are no longer reachable without an account. Logged-out visitors go
// back to the landing page, which is where they choose to sign up or log in.
//
// This is deliberately a redirect to "/" rather than to /auth/login — a
// visitor who lands on a profile link has no context yet, so the pitch is a
// better destination than a bare login form.
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [isLoading, user, router]);

  return { user, isLoading };
}
