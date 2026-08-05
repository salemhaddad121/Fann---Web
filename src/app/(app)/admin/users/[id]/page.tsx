"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getAdminUser, updateAdminUserStatus, resetAdminUserPassword } from "@/lib/admin-api";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ComingSoon } from "@/components/shell/ComingSoon";
import { Button } from "@/components/auth/Button";
import { initialsFromName } from "@/lib/format";
import { badgeColor } from "@/lib/badge-colors";
import type { AdminUserDetail, UserStatus } from "@/types/admin";

// Every action on this page is confirmed before it runs. `status` actions
// change what the user can do with their account; `reset-password` replaces
// their credentials outright — none of them should fire on a stray click.
type PendingAction =
  | { kind: "status"; status: UserStatus }
  | { kind: "reset-password" };

const STATUS_COPY: Record<UserStatus, { title: string; body: string; confirmLabel: string; destructive: boolean }> = {
  active: {
    title: "Approve this user?",
    body: "They'll be able to sign in and use their account, and they'll be notified.",
    confirmLabel: "Approve",
    destructive: false,
  },
  suspended: {
    title: "Suspend this user?",
    body: "They'll lose access until you reactivate them, and they'll be notified.",
    confirmLabel: "Suspend",
    destructive: true,
  },
  banned: {
    title: "Reject this user?",
    body: "They'll lose access to the platform and be notified. You can reactivate them later.",
    confirmLabel: "Reject",
    destructive: true,
  },
  pending_review: {
    title: "Move back to pending?",
    body: "The account will await review again.",
    confirmLabel: "Confirm",
    destructive: false,
  },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-hairline py-2 text-sm">
      <dt className="text-faint">{label}</dt>
      <dd className="text-ink font-medium text-right">{value}</dd>
    </div>
  );
}

function AdminUserDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminUser(id)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this user.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function runPending() {
    if (!pending) return;
    setBusy(true);
    setError(null);
    try {
      if (pending.kind === "status") {
        await updateAdminUserStatus(id, pending.status);
        setDetail((prev) => (prev ? { ...prev, status: pending.status } : prev));
      } else {
        const { temporaryPassword } = await resetAdminUserPassword(id);
        setTempPassword(temporaryPassword);
      }
      setPending(null);
    } catch (err) {
      setPending(null);
      setError(err instanceof Error ? err.message : "Couldn't complete that action.");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!detail) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  const name = detail.display_name ?? detail.email;

  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline">
        <button onClick={() => router.back()} className="text-muted">
          <i className="ti ti-arrow-left text-lg" />
        </button>
        <span className="text-sm font-semibold text-ink">User details</span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-semibold ${badgeColor(name)}`}>
            {initialsFromName(name)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-ink">{name}</span>
              {detail.is_verified && <i className="ti ti-rosette-discount-check text-clay" />}
            </div>
            <UserStatusBadge status={detail.status} deletedAt={detail.deleted_at} />
          </div>
        </div>

        <dl className="mb-4">
          <Row label="Email" value={detail.email} />
          {detail.phone && <Row label="Phone" value={detail.phone} />}
          <Row label="Role" value={detail.role[0].toUpperCase() + detail.role.slice(1)} />
          <Row label="Account code" value={detail.account_code} />
          <Row
            label="Joined"
            value={new Date(detail.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          />
          {detail.last_login_at && (
            <Row
              label="Last login"
              value={new Date(detail.last_login_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            />
          )}
          <Row label="Email verified" value={detail.email_verified_at ? "Yes" : "No"} />
          <Row label="Phone verified" value={detail.phone_verified_at ? "Yes" : "No"} />
        </dl>

        {detail.doc_status && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-ink mb-1.5">ID document</p>
            <div className="border border-hairline rounded-xl p-3 text-sm">
              <p className="text-ink">Status: {detail.doc_status}</p>
              {detail.doc_rejection_reason && (
                <p className="text-danger text-xs mt-1">{detail.doc_rejection_reason}</p>
              )}
            </div>
          </div>
        )}

        {detail.latest_payment && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-ink mb-1.5">Latest payment</p>
            <div className="border border-hairline rounded-xl p-3 text-sm">
              <p className="text-ink">
                ${Number(detail.latest_payment.amount_usd).toLocaleString()} · {detail.latest_payment.status}
              </p>
              <p className="text-xs text-faint">{detail.latest_payment.transfer_service}</p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-danger mb-3">{error}</p>}

        {tempPassword && (
          <div className="mb-4 border border-[#86EFAC] bg-[#F0FDF4] rounded-xl p-3.5">
            <p className="text-xs font-semibold text-[#166534] mb-1.5">
              Temporary password — shown once
            </p>
            <p className="font-mono text-base font-bold text-ink tracking-wide break-all">
              {tempPassword}
            </p>
            <p className="text-[11px] text-[#166534] mt-2 leading-relaxed">
              Give this to {name} over a channel you trust. It isn&apos;t stored anywhere, so it
              can&apos;t be shown again — you&apos;d have to reset once more. Ask them to change it
              from Account settings after signing in.
            </p>
            <button
              onClick={() => setTempPassword(null)}
              className="mt-2.5 text-xs font-semibold text-[#166534] underline"
            >
              Done — hide it
            </button>
          </div>
        )}

        {detail.role !== "admin" && (
          <div className="flex flex-wrap gap-2">
            {detail.status === "pending_review" && (
              <>
                <Button
                  disabled={busy}
                  onClick={() => setPending({ kind: "status", status: "active" })}
                  className="w-auto px-4"
                >
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setPending({ kind: "status", status: "banned" })}
                  className="w-auto px-4"
                >
                  Reject
                </Button>
              </>
            )}
            {detail.status === "active" && (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => setPending({ kind: "status", status: "suspended" })}
                className="w-auto px-4"
              >
                Suspend
              </Button>
            )}
            {detail.status === "suspended" && (
              <Button
                disabled={busy}
                onClick={() => setPending({ kind: "status", status: "active" })}
                className="w-auto px-4"
              >
                Reactivate
              </Button>
            )}
            {(detail.status === "active" || detail.status === "suspended") && (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => setPending({ kind: "status", status: "banned" })}
                className="w-auto px-4"
              >
                Ban
              </Button>
            )}
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => setPending({ kind: "reset-password" })}
              className="w-auto px-4"
            >
              Reset password
            </Button>
          </div>
        )}
      </div>

      {pending && (
        <ConfirmDialog
          title={pending.kind === "status" ? STATUS_COPY[pending.status].title : "Reset this password?"}
          body={
            pending.kind === "status" ? (
              <>
                <strong className="text-ink">{name}</strong> — {STATUS_COPY[pending.status].body}
              </>
            ) : (
              <>
                A new temporary password will be generated for{" "}
                <strong className="text-ink">{name}</strong> and shown to you once. Their current
                password stops working immediately.
              </>
            )
          }
          confirmLabel={
            pending.kind === "status" ? STATUS_COPY[pending.status].confirmLabel : "Reset password"
          }
          destructive={pending.kind === "status" ? STATUS_COPY[pending.status].destructive : true}
          busy={busy}
          onConfirm={runPending}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return null;

  if (user.role !== "admin") {
    return <ComingSoon title="User details" blurb="This area is for admin accounts only." />;
  }

  return <AdminUserDetailContent id={params.id} />;
}
