"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Banner } from "@/components/auth/Banner";
import { setTokens } from "@/lib/tokens";
import { useAuth } from "@/lib/auth-context";

function CallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const [error] = useState<string | null>(
    !accessToken || !refreshToken ? "Sign-in didn't complete. Please try again." : null,
  );

  useEffect(() => {
    if (!accessToken || !refreshToken) return;
    setTokens(accessToken, refreshToken);
    refreshUser().then((user) => {
      router.replace(user ? "/dashboard" : "/auth/login");
    });
  }, [accessToken, refreshToken, refreshUser, router]);

  return (
    <AuthShell title="Signing you in…">
      {error ? <Banner kind="error">{error}</Banner> : <p className="text-sm text-muted">One moment.</p>}
    </AuthShell>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
