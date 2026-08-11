"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { RoleToggle } from "@/components/auth/RoleToggle";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import type { RegisterPayload } from "@/types/auth";

const PASSWORD_HINT = "At least 8 characters, with an uppercase letter, a lowercase letter, and a number.";

function RegisterForm() {
  const { register } = useAuth();
  // The landing page's two JOIN NOW buttons link here with ?role=artist or
  // ?role=planner so each side starts on the right toggle. Anything else
  // falls back to artist, as before.
  const initialRole = useSearchParams().get("role") === "planner" ? "planner" : "artist";
  const [role, setRole] = useState<RegisterPayload["role"]>(initialRole);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  // Tracked separately rather than as one "agreed" flag: the two documents
  // are versioned independently server-side, so the acceptance has to be
  // independent too.
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
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
    if (!acceptedTerms) errors.acceptedTerms = "You must accept the Terms of Service to sign up.";
    if (!acceptedPrivacy) errors.acceptedPrivacy = "You must accept the Privacy Policy to sign up.";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        role,
        phone: phone || undefined,
        acceptedTerms,
        acceptedPrivacy,
      });
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
        <Link href="/auth/login" className="text-sm font-semibold text-clay">
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Fann as an artist or an event planner."
      background={role === "planner" ? "planner" : "artist"}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-clay">
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

        {/* Two checkboxes rather than one combined line: the documents are
            versioned separately server-side, so a user has to be able to
            have accepted one version of each independently. Links open in a
            new tab so reading them doesn't discard a part-filled form. */}
        <div className="mb-4 flex flex-col gap-2.5">
          <ConsentCheckbox
            name="acceptedTerms"
            checked={acceptedTerms}
            onChange={setAcceptedTerms}
            error={fieldErrors.acceptedTerms}
            href="/terms"
            label="Terms of Service"
          />
          <ConsentCheckbox
            name="acceptedPrivacy"
            checked={acceptedPrivacy}
            onChange={setAcceptedPrivacy}
            error={fieldErrors.acceptedPrivacy}
            href="/privacy"
            label="Privacy Policy"
          />
        </div>

        <Button type="submit" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}

function ConsentCheckbox({
  name,
  checked,
  onChange,
  error,
  href,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  error?: string;
  href: string;
  label: string;
}) {
  return (
    <div>
      <label className="flex items-start gap-2.5 text-xs text-muted cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          className="mt-0.5 w-4 h-4 accent-clay-deep shrink-0"
        />
        <span>
          I agree to the{" "}
          {/* Deliberately not a <Link>: this sits inside a <label>, and a
              client-side navigation would throw away the form. */}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-clay-deep underline"
          >
            {label}
          </a>
        </span>
      </label>
      {error && <p className="mt-1 ml-6 text-xs text-danger">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
