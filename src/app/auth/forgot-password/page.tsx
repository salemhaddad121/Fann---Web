"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { apiFetch, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", { method: "POST", body: { email }, auth: false });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <Banner kind="success">
          If an account exists for <strong>{email}</strong>, a password reset link is on its way.
        </Banner>
        <Link href="/auth/login" className="text-sm font-semibold text-indigo">
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="We'll email you a link to reset it."
      footer={
        <Link href="/auth/login" className="font-semibold text-indigo">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && <Banner kind="error">{error}</Banner>}
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
        <Button type="submit" loading={loading}>
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
