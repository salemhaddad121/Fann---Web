"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LandingPage } from "@/components/landing/LandingPage";
import { homePathFor } from "@/lib/nav-config";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Logged-out visitors now get the marketing landing page here rather than
  // being bounced into /search. Logged-in users still go straight to their
  // own home.
  useEffect(() => {
    if (isLoading || !user) return;
    router.replace(homePathFor(user.role));
  }, [isLoading, user, router]);

  if (isLoading || user) return null;

  return <LandingPage />;
}
