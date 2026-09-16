"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { apiFetch, ApiError } from "@/lib/api";

const PASSWORD_HINT = "At least 8 characters, with an uppercase letter, a lowercase letter, and a number.";

/**
 * Whether the link is any good — asked once, on mount.
 *
 * "checking" is its own state rather than an optimistic render, because the
 * bug being fixed is precisely that the form appeared for a dead link: the
 * user typed a new password twice, pressed submit, and only then learned
 * the link had expired. Showing the form and taking it away would be the
 * same insult with extra steps.
 */
type TokenState = "checking" | "valid" | "invalid" | "unknown";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // A link with no ?token at all is knowable at render time, so it is the
  // initial state rather than something an effect discovers — setting state
  // synchronously inside an effect is both a wasted render and what
  // react-hooks/set-state-in-effect exists to stop.
  const [tokenState, setTokenState] = useState<TokenState>(token ? "checking" : "invalid");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    apiFetch<{ valid: boolean }>(
      `/auth/reset-password/valid?token=${encodeURIComponent(token)}`,
      { auth: false },
    )
      .then((res) => {
        if (!cancelled) setTokenState(res.valid ? "valid" : "invalid");
      })
      .catch(() => {
        // The check itself failed — the API is unreachable or throttled. The
        // token may well be fine, so show the form rather than telling
        // someone their working link is dead. Submitting still validates it
        // server-side, which is the path this page had before.
        if (!cancelled) setTokenState("unknown");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

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

  if (tokenState === "checking") {
    return (
      <AuthShell title="Set a new password">
        <p className="py-6 text-center text-sm text-faint" role="status">
          Checking your link…
        </p>
      </AuthShell>
    );
  }

  if (tokenState === "invalid") {
    return (
      <AuthShell
        title="This link has expired"
        footer={
          <Link href="/auth/login" className="font-semibold text-clay">
            Back to log in
          </Link>
        }
      >
        <Banner kind="error">
          Password reset links are single-use and time-limited. Request a new one and it will
          arrive in a moment.
        </Banner>
        <Button onClick={() => router.push("/auth/forgot-password")}>
          Send me a new link
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      footer={
        <Link href="/auth/login" className="font-semibold text-clay">
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
