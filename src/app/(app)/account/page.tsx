"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { changePassword, deleteAccount } from "@/lib/account-api";
import { clearTokens } from "@/lib/tokens";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { ApiError } from "@/lib/api";

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
      clearTokens();
      // Hard navigation, not router.push — forces AuthProvider to fully
      // re-check (and find no) tokens, rather than carrying over any
      // stale in-memory user state from before the deletion.
      window.location.href = "/search";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete your account.");
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <div className="border border-hairline rounded-xl p-3.5">
        <p className="text-xs text-muted leading-relaxed mb-3">
          Deleting your account removes your profile from search immediately. Past bookings,
          reviews, and messages are kept for the other people involved in them — this can&apos;t
          be undone.
        </p>
        <button
          onClick={() => setConfirming(true)}
          className="text-xs font-semibold text-danger"
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

export default function AccountPage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="max-w-lg mx-auto pb-10">
      <h1 className="text-lg font-bold text-ink px-4 pt-4 pb-1">Account settings</h1>

      <div className="p-4">
        <p className="text-xs font-bold text-ink mb-2">Account</p>
        <div className="mb-5">
          <Row
            label="Email"
            value={user.email}
            trailing={
              user.emailVerifiedAt ? (
                <i className="ti ti-rosette-discount-check text-success text-sm" />
              ) : undefined
            }
          />
          <Row
            label="Phone"
            value={user.phone ? String(user.phone) : "Not added"}
            trailing={
              user.phone ? (
                user.phoneVerifiedAt ? (
                  <i className="ti ti-rosette-discount-check text-success text-sm" />
                ) : (
                  <Link href="/auth/verify-phone" className="text-xs font-semibold text-indigo">
                    Verify
                  </Link>
                )
              ) : (
                <Link href="/auth/verify-phone" className="text-xs font-semibold text-indigo">
                  Add
                </Link>
              )
            }
          />
          <Row label="Role" value={user.role[0].toUpperCase() + user.role.slice(1)} />
          {user.accountCode && <Row label="Account code" value={String(user.accountCode)} />}
          {memberSince && <Row label="Member since" value={memberSince} />}
        </div>

        <p className="text-xs font-bold text-ink mb-2">Change password</p>
        <div className="mb-6">
          <ChangePasswordForm />
        </div>

        <p className="text-xs font-bold text-ink mb-2">Delete account</p>
        <div className="mb-6">
          <DeleteAccountSection />
        </div>

        <Button variant="ghost" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
