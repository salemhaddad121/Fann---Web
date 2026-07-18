"use client";

import { Suspense, useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { apiFetch, ApiError } from "@/lib/api";

const PASSWORD_HINT = "At least 8 characters, with an uppercase letter, a lowercase letter, and a number.";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This link is missing its reset token. Request a new one.");
      return;
    }
    if (password.length < 8) {
      setError(PASSWORD_HINT);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", { method: "POST", body: { token, password }, auth: false });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "This link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Password updated">
        <Banner kind="success">Your password has been reset. You can log in with it now.</Banner>
        <Button onClick={() => router.push("/auth/login")}>Continue to log in</Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      footer={
        <Link href="/auth/login" className="font-semibold text-indigo">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && <Banner kind="error">{error}</Banner>}
        <FormField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="-mt-3 mb-4 text-xs text-faint">{PASSWORD_HINT}</p>
        <FormField
          label="Confirm new password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" loading={loading}>
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
