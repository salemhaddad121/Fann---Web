"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { RoleToggle } from "@/components/auth/RoleToggle";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import type { RegisterPayload } from "@/types/auth";

const PASSWORD_HINT = "At least 8 characters, with an uppercase letter, a lowercase letter, and a number.";

export default function RegisterPage() {
  const { register } = useAuth();
  const [role, setRole] = useState<RegisterPayload["role"]>("artist");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
    if (password.length < 8) errors.password = PASSWORD_HINT;
    if (phone && !/^\+?[1-9]\d{6,14}$/.test(phone)) {
      errors.phone = "Enter a valid international phone number, e.g. +9613123456.";
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register({ email, password, role, phone: phone || undefined });
      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="One more step before you're in."
        background={role === "planner" ? "planner" : "artist"}
      >
        <Banner kind="success">
          We&apos;ve sent a verification link to <strong>{email}</strong>. Open it to activate your
          account, then come back and log in.
        </Banner>
        <Link href="/auth/login" className="text-sm font-semibold text-indigo">
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Aynu as an artist or an event planner."
      background={role === "planner" ? "planner" : "artist"}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-indigo">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {formError && <Banner kind="error">{formError}</Banner>}

        <RoleToggle value={role} onChange={setRole} />

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <FormField
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+9613123456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldErrors.phone}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        {!fieldErrors.password && <p className="-mt-3 mb-4 text-xs text-faint">{PASSWORD_HINT}</p>}

        <Button type="submit" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
