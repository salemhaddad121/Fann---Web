"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  changePassword,
  changeEmail,
  deleteAccount,
  getMarketingConsent,
  setMarketingConsent,
} from "@/lib/account-api";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { OtpInput } from "@/components/auth/OtpInput";
import { ApiError } from "@/lib/api";
import { SubscriptionSection } from "@/components/subscriptions/SubscriptionSection";

function Row({ label, value, trailing }: { label: string; value: string; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-2.5 text-sm">
      <span className="text-faint">{label}</span>
      <span className="flex items-center gap-1.5 text-ink font-medium">
        {value}
        {trailing}
      </span>
    </div>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <Banner kind="error">{error}</Banner>}
      {success && <Banner kind="success">Password updated.</Banner>}

      <FormField
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <FormField
        label="New password"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <p className="-mt-3 mb-4 text-xs text-faint">
        At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
      </p>
      <FormField
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button type="submit" loading={saving}>
        Update password
      </Button>
    </form>
  );
}

function ChangeEmailForm() {
  const { refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    setSaving(true);
    try {
      const { message } = await changeEmail(currentPassword, newEmail);
      setSuccessMessage(message);
      setCurrentPassword("");
      setNewEmail("");
      // Pull the fresh user record so the pending-email note below
      // appears right away, without waiting for the next page load.
      await refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change your email.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <Banner kind="error">{error}</Banner>}
      {successMessage && <Banner kind="success">{successMessage}</Banner>}

      <FormField
        label="New email address"
        type="email"
        autoComplete="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
      />
      <FormField
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Leave blank if you signed up with Google/Apple"
      />

      <Button type="submit" loading={saving}>
        Update email
      </Button>
    </form>
  );
}

// Changing the number reuses the same OTP pair as signup verification:
// send-otp writes the new number to the user record and texts a code,
// verify-otp marks it verified. Done inline here rather than linking out
// to /auth/verify-phone so the whole settings list behaves consistently.
function ChangeNumberForm() {
  const { user, sendOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!/^\+?[1-9]\d{6,14}$/.test(phone)) {
      setError("Enter a valid international phone number, e.g. +9613123456.");
      return;
    }
    setBusy(true);
    try {
      await sendOtp(phone);
      setStep("code");
      setNotice("We sent a 6-digit code over WhatsApp.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.length !== 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setBusy(true);
    try {
      await verifyOtp(phone, code);
      setNotice("Phone number updated.");
      setStep("phone");
      setPhone("");
      setCode("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That code didn't work.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={handleVerify}>
        {error && <Banner kind="error">{error}</Banner>}
        {notice && <Banner kind="success">{notice}</Banner>}
        <p className="text-xs text-muted mb-3">
          Enter the code sent to <span className="font-semibold text-ink">{phone}</span>.
        </p>
        <div className="mb-4">
          <OtpInput value={code} onChange={setCode} />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError(null);
              setNotice(null);
            }}
          >
            Back
          </Button>
          <Button type="submit" loading={busy} className="flex-1">
            Verify
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSend}>
      {error && <Banner kind="error">{error}</Banner>}
      {notice && <Banner kind="success">{notice}</Banner>}
      <FormField
        label="New phone number"
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={user?.phone ? String(user.phone) : "+9613123456"}
      />
      <Button type="submit" loading={busy}>
        Send verification code
      </Button>
    </form>
  );
}

/**
 * The withdrawal half of T&C §24.2: a marketing consent that cannot be
 * taken back is not a valid consent.
 *
 * Renders nothing until the current value is known. A checkbox that
 * defaults to unchecked and then corrects itself a moment later would show
 * some users the opposite of their real setting, and this is a control
 * where the wrong state read for even a moment is worth avoiding — it is
 * the one people open the page specifically to check.
 *
 * The write is optimistic and reverts on failure. Each PUT appends a row
 * server-side rather than updating one, so toggling twice is not a
 * correction of a mistake: it is two recorded decisions, which is what the
 * audit trail is for.
 */
function CommunicationPreferences() {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMarketingConsent()
      .then(({ granted }) => {
        if (!cancelled) setGranted(granted);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your preference.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggle(next: boolean) {
    const previous = granted;
    setGranted(next);
    setError(null);
    setSaving(true);
    try {
      await setMarketingConsent(next);
    } catch {
      setGranted(previous);
      setError("Couldn't save that. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (granted === null) {
    return (
      <p className="rounded-[10px] border border-hairline px-3.5 py-3 text-xs text-faint">
        {error ?? "Loading…"}
      </p>
    );
  }

  return (
    <div className="rounded-[10px] border border-hairline px-3.5 py-3">
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={granted}
          disabled={saving}
          onChange={(e) => handleToggle(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-clay-deep"
        />
        <span className="text-xs leading-relaxed text-muted">
          <span className="font-medium text-ink">Marketing emails</span>
          <br />
          Occasional emails about new artists and Fann updates. Turning this
          off does not affect emails about your account, bookings or
          payments.
        </span>
      </label>
      {error && <p className="mt-2 ml-6 text-xs text-danger">{error}</p>}
    </div>
  );
}

function DeleteAccountSection() {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDeleting(true);
    try {
      await deleteAccount(password);
      // Hard navigation, not router.push — forces AuthProvider to fully
      // re-check via GET /auth/me (which will now 401, since the account
      // is soft-deleted and the backend already cleared the auth cookies)
      // rather than carrying over any stale in-memory user state.
      window.location.href = "/search";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete your account.");
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <div className="border border-[#FCA5A5] bg-danger-bg rounded-xl p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <i className="ti ti-alert-triangle text-danger text-sm" />
          <p className="text-xs font-bold text-danger">Danger zone</p>
        </div>
        <p className="text-xs text-muted leading-relaxed mb-3">
          Deleting your account removes your profile from search immediately. Past bookings,
          reviews, and messages are kept for the other people involved in them — this can&apos;t
          be undone.
        </p>
        <button
          onClick={() => setConfirming(true)}
          className="w-full rounded-[10px] bg-danger text-white text-xs font-semibold py-2.5"
        >
          Delete my account
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleDelete} className="border border-[#FCA5A5] bg-danger-bg rounded-xl p-3.5">
      {error && <Banner kind="error">{error}</Banner>}
      <p className="text-xs text-danger font-semibold mb-3">
        This is permanent. Enter your password to confirm.
      </p>
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Leave blank if you signed up with Google/Apple"
      />
      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={() => setConfirming(false)} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={deleting} className="flex-1 !bg-danger">
          Confirm deletion
        </Button>
      </div>
    </form>
  );
}

/**
 * A settings section that opens on demand (item 25).
 *
 * The three change-forms — email, number, password — were all expanded at
 * once, which is how this page came to be about four screens long. Almost
 * nobody arrives wanting to change all three, and an open form is a
 * standing invitation to type in the wrong one.
 *
 * <details> rather than useState: it is open/closed state that the browser
 * already owns, it is keyboard- and screen-reader-correct without help, and
 * it survives this component re-rendering underneath it.
 */
function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group mb-3 rounded-[10px] border border-hairline">
      <summary className="flex list-none items-center justify-between px-3.5 py-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <i
          className="ti ti-chevron-down text-base text-faint transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-hairline px-3.5 pb-4 pt-3.5">{children}</div>
    </details>
  );
}

/**
 * Sign out. A plain row rather than a Button, so it reads as one more
 * settings action rather than the page's primary call to action — the
 * primary action on Settings is never "leave".
 */
function LogOutRow() {
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={logout}
      className="mb-6 flex w-full items-center justify-between rounded-[10px] border border-hairline px-3.5 py-3 text-sm"
    >
      <span className="font-medium text-ink">Log out</span>
      <i className="ti ti-logout text-base text-faint" aria-hidden />
    </button>
  );
}

export default function AccountPage() {
  const { user } = useAuth();
  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    // Two columns above 1024px (item 24). Eight sections stacked in one
    // narrow column left the right half of a 1280px screen empty while the
    // page ran four screens deep. Account and Subscription on the left,
    // Security and the danger zone on the right — grouped by what they are
    // about, not by how they happened to be ordered.
    //
    // Below lg it is the single column it always was, in the same order.
    <div className="mx-auto max-w-lg pb-10 lg:max-w-5xl">
      <h1 className="px-4 pb-1 pt-4 text-lg font-bold text-ink">Settings</h1>

      <div className="p-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
        <div>
        <p className="text-xs font-bold text-ink mb-2">Account</p>
        <div className="mb-5">
          <Row
            label="Email"
            value={user.email}
            trailing={
              user.emailVerifiedAt ? (
                <i className="ti ti-discount-check text-success text-sm" />
              ) : undefined
            }
          />
          {user.pendingEmail && (
            <p className="text-xs text-faint -mt-1.5 mb-1">
              Pending confirmation for <span className="font-medium text-muted">{user.pendingEmail}</span> —
              check that inbox for the verification link.
            </p>
          )}
          <Row
            label="Phone"
            value={user.phone ? String(user.phone) : "Not added"}
            trailing={
              user.phone ? (
                user.phoneVerifiedAt ? (
                  <i className="ti ti-discount-check text-success text-sm" />
                ) : (
                  <Link
                    href="/auth/verify-phone"
                    className="-my-3 flex h-11 items-center px-1 text-xs font-semibold text-clay"
                  >
                    Verify
                  </Link>
                )
              ) : (
                <Link
                  href="/auth/verify-phone"
                  className="-my-3 flex h-11 items-center px-1 text-xs font-semibold text-clay"
                >
                  Add
                </Link>
              )
            }
          />
          <Row label="Role" value={user.role[0].toUpperCase() + user.role.slice(1)} />
          {/* Account code is deliberately not shown here. It is the payment
              reconciliation key, not an identifier a user needs day to day,
              and showing it invites people to quote it in the wrong places.
              It appears where it is actually needed — on the payment
              instructions screen — and the column stays, since matching an
              incoming transfer depends on it. */}
          {memberSince && <Row label="Member since" value={memberSince} />}
        </div>

        {/* Bookers only — artists have nothing to subscribe to. */}
        {user.role === "planner" && (
          <>
            <p className="text-xs font-bold text-ink mb-2">Subscription</p>
            <div className="mb-6">
              <SubscriptionSection />
            </div>
          </>
        )}

        <p className="text-xs font-bold text-ink mb-2">Communication</p>
        <div className="mb-6">
          <CommunicationPreferences />
        </div>

        {/* The signed-in route to /help. The guest route is the header
            link in GuestChrome and the footer's Support column. */}
        <Link
          href="/help"
          className="mb-6 flex items-center justify-between rounded-[10px] border border-hairline px-3.5 py-3 text-sm"
        >
          <span className="font-medium text-ink">Help &amp; support</span>
          <i className="ti ti-chevron-right text-base text-faint" aria-hidden />
        </Link>

        {/* Log out lived in exactly one place — the foot of the desktop
            Sidebar, which is lg:-only — so at 390px no artist or planner
            could sign out at all. Settings is where people look for it, and
            this is the same control for every role, at every width.

            Deliberately NOT next to Delete account: they are both "end my
            session with this product" shaped, one is reversible and one is
            not, and putting them side by side is how a mis-tap becomes a
            deleted account. */}
        <LogOutRow />
        </div>

        <div>
        <p className="text-xs font-bold text-ink mb-2">Security</p>
        <div className="mb-6">
          <Disclosure title="Change email">
            <ChangeEmailForm />
          </Disclosure>
          <Disclosure title="Change number">
            <ChangeNumberForm />
          </Disclosure>
          <Disclosure title="Change password">
            <ChangePasswordForm />
          </Disclosure>
        </div>

        {/* Admins have no self-service delete — the destructive section is
            hidden for them (artists and planners still see it). Kept last
            so the destructive action sits at the bottom of the list. */}
        {user.role !== "admin" && (
          <div className="mb-6">
            <DeleteAccountSection />
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
