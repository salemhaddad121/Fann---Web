"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getAdminUser, updateAdminUserStatus } from "@/lib/admin-api";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { ComingSoon } from "@/components/shell/ComingSoon";
import { Button } from "@/components/auth/Button";
import { initialsFromName } from "@/lib/format";
import { badgeColor } from "@/lib/badge-colors";
import type { AdminUserDetail, UserStatus } from "@/types/admin";

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

  async function handleStatus(next: UserStatus) {
    setBusy(true);
    try {
      await updateAdminUserStatus(id, next);
      setDetail((prev) => (prev ? { ...prev, status: next } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update this user.");
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
              {detail.is_verified && <i className="ti ti-rosette-discount-check text-indigo" />}
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

        {detail.role !== "admin" && (
          <div className="flex flex-wrap gap-2">
            {detail.status === "pending_review" && (
              <>
                <Button disabled={busy} onClick={() => handleStatus("active")} className="w-auto px-4">
                  Approve
                </Button>
                <Button variant="ghost" disabled={busy} onClick={() => handleStatus("banned")} className="w-auto px-4">
                  Reject
                </Button>
              </>
            )}
            {detail.status === "active" && (
              <Button variant="ghost" disabled={busy} onClick={() => handleStatus("suspended")} className="w-auto px-4">
                Suspend
              </Button>
            )}
            {detail.status === "suspended" && (
              <Button disabled={busy} onClick={() => handleStatus("active")} className="w-auto px-4">
                Reactivate
              </Button>
            )}
            {(detail.status === "active" || detail.status === "suspended") && (
              <Button variant="ghost" disabled={busy} onClick={() => handleStatus("banned")} className="w-auto px-4">
                Ban
              </Button>
            )}
          </div>
        )}
      </div>
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
