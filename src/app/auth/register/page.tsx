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
  // Optional, and unchecked like the others. §24.2 requires marketing
  // consent to be a positive act and to be separable from the Terms, so
  // this one never blocks the form — there is no validation for it below.
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
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
        acceptedMarketing,
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

        {/* Separate checkboxes rather than one combined line: the two
            documents are versioned independently server-side, so a user has
            to be able to have accepted one version of each. Links open in a
            new tab so reading them doesn't discard a part-filled form. */}
        <div className="mb-4 flex flex-col">
          <ConsentCheckbox
            name="acceptedTerms"
            checked={acceptedTerms}
            onChange={setAcceptedTerms}
            error={fieldErrors.acceptedTerms}
          >
            I agree to the <ConsentLink href="/terms">Terms of Service</ConsentLink>
          </ConsentCheckbox>
          <ConsentCheckbox
            name="acceptedPrivacy"
            checked={acceptedPrivacy}
            onChange={setAcceptedPrivacy}
            error={fieldErrors.acceptedPrivacy}
          >
            I agree to the <ConsentLink href="/privacy">Privacy Policy</ConsentLink>
          </ConsentCheckbox>

          {/* Visually separated from the two above so it does not read as a
              third thing you have to accept. Wording is deliberately plain
              about what it covers and how to stop — §24.2 consent has to be
              specific, and CONSENT_VERSIONS.marketing versions this exact
              sentence. Change it and bump that date on both sides. */}
          <ConsentCheckbox
            name="acceptedMarketing"
            checked={acceptedMarketing}
            onChange={setAcceptedMarketing}
            className="mt-1 border-t border-hairline pt-3"
          >
            <span className="text-faint">Optional — </span>
            send me occasional emails about new artists and Fann updates. You
            can turn this off at any time in Settings.
          </ConsentCheckbox>
        </div>

        <Button type="submit" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}

/**
 * Deliberately not a <Link>: this sits inside a <label>, so a client-side
 * navigation would throw away the part-filled form. stopPropagation keeps
 * clicking the link from also toggling the box it sits in.
 */
function ConsentLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="font-semibold text-clay-deep underline"
    >
      {children}
    </a>
  );
}

// Takes its label as children rather than a document name. The two
// mandatory boxes say "I agree to the <document>"; the optional marketing
// one says something else entirely, and building that out of a `label`
// prop would have meant a second component doing the same job.
function ConsentCheckbox({
  name,
  checked,
  onChange,
  error,
  className,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      {/* The whole row is the label and the box is 24x24, so the target is
          the sentence rather than a 16px square beside it. These two are the
          only controls on the form that gate submission, and they were the
          smallest things on it. */}
      <label className="flex cursor-pointer items-start gap-2.5 py-2 text-xs text-muted">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          className="h-6 w-6 shrink-0 accent-clay-deep"
        />
        <span className="pt-0.5">{children}</span>
      </label>
      {error && <p className="ml-8 mt-1 text-xs text-danger">{error}</p>}
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
