"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import { homePathFor } from "@/lib/nav-config";
import { EMAIL_NOT_VERIFIED } from "@/types/auth";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  // Mirrors /auth/register: an entry point can carry the side it came from,
  // and the social buttons pass it through as the OAuth `state`. Only
  // matters for someone who has no account yet — a returning user is found
  // by their existing link or verified email and the role is ignored.
  const role = useSearchParams().get("role") === "planner" ? "planner" : "artist";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Tracked apart from `error` because it is not a credentials problem and
  // must not be shown as one. The API says so explicitly with a code rather
  // than leaving the client to match on wording.
  const [unverified, setUnverified] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResendState("idle");
    setLoading(true);
    try {
      const signedIn = await login(email, password);
      router.push(homePathFor(signedIn.role));
    } catch (err) {
      if (err instanceof ApiError && err.code === EMAIL_NOT_VERIFIED) {
        setUnverified(true);
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendState("sending");
    try {
      await apiFetch("/auth/resend-verification", {
        method: "POST",
        body: { email },
        auth: false,
      });
    } catch {
      // The endpoint answers the same way whatever happens, deliberately —
      // a response that varied would tell an anonymous caller whether an
      // address is registered. So there is nothing a failure here could
      // usefully say that the success message does not already say.
    }
    setResendState("sent");
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your Fann account."
      footer={
        <>
          New to Fann?{" "}
          <Link href="/auth/register" className="font-semibold text-clay">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && <Banner kind="error">{error}</Banner>}

        {unverified && (
          <Banner kind="error">
            <p className="font-semibold">Verify your email first</p>
            <p className="mt-1">
              We sent a link to <strong>{email}</strong>. Open it to activate your account.
            </p>
            {resendState === "sent" ? (
              <p className="mt-2 font-semibold">
                Sent. Check your inbox — and your spam folder.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendState === "sending"}
                className="mt-2 font-semibold underline disabled:opacity-60"
              >
                {resendState === "sending" ? "Sending…" : "Send it again"}
              </button>
            )}
          </Banner>
        )}

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="-mt-3 mb-4 text-right">
            <Link href="/auth/forgot-password" className="text-xs font-semibold text-clay">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" loading={loading}>
          Log in
        </Button>
      </form>

      {/* consentNotice because these buttons can still CREATE an account for
          someone who has never signed up, and the API records a Terms and
          Privacy acceptance when they do. */}
      <SocialButtons role={role} consentNotice />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
