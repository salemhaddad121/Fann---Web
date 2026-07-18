"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Banner } from "@/components/auth/Banner";
import { useAuth } from "@/lib/auth-context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // By the time this page loads, the backend's redirect has already set
    // the accessToken/refreshToken cookies (see google/apple callback in
    // auth.controller.ts) — there's nothing in the URL to read anymore.
    // We just ask who that cookie belongs to.
    refreshUser().then((user) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        setError("Sign-in didn't complete. Please try again.");
      }
    });
  }, [refreshUser, router]);

  return (
    <AuthShell title="Signing you in…">
      {error ? <Banner kind="error">{error}</Banner> : <p className="text-sm text-muted">One moment.</p>}
    </AuthShell>
  );
}
