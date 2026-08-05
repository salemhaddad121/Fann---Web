"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { Banner } from "@/components/auth/Banner";
import { apiFetch, ApiError } from "@/lib/api";

type Status = "checking" | "success" | "error";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "checking" : "error");
  const [message, setMessage] = useState<string>(
    token ? "" : "This link is missing its verification token.",
  );

  useEffect(() => {
    if (!token) return; // initial state above already reflects this
    apiFetch<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
      auth: false,
    })
      .then((res) => {
        setStatus("success");
        setMessage(res.message ?? "Your email is verified.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "This link is invalid or has expired.");
      });
  }, [token]);

  return (
    <AuthShell title="Email verification">
      {status === "checking" && <p className="text-sm text-muted">Checking your link…</p>}
      {status === "success" && (
        <>
          <Banner kind="success">{message}</Banner>
          <Link href="/auth/login" className="text-sm font-semibold text-clay">
            Continue to log in
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <Banner kind="error">{message}</Banner>
          <Link href="/auth/login" className="text-sm font-semibold text-clay">
            Back to log in
          </Link>
        </>
      )}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
