"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "admin") router.replace("/admin");
  }, [user, router]);

  if (!user || user.role === "admin") return null;

  return (
    <div className="p-4">
      <div className="mb-5">
        <h1 className="text-[17px] font-bold text-ink mb-0.5">
          {greeting()}, {user.email.split("@")[0]}
        </h1>
      </div>

      <div className="bg-surface border border-hairline rounded-2xl p-5 mb-4">
        <p className="text-xs font-semibold text-ink mb-3">Your account</p>
        <dl className="text-sm space-y-2">
          <Row label="Email" value={user.email} />
          <Row label="Role" value={user.role} />
          {user.phone && <Row label="Phone" value={String(user.phone)} />}
          <Row label="Status" value={user.status} />
        </dl>
      </div>

      {/* My Bookings moved to the sidebar/bottom nav, and Log out to the
          foot of the sidebar — both are reachable from every page now,
          so duplicating them here would just be a second place to
          maintain. */}
      {user.phone && !user.phoneVerifiedAt && (
        <Link
          href="/auth/verify-phone"
          className="block mb-4 text-sm font-semibold text-clay underline"
        >
          Verify your phone number →
        </Link>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-hairline pb-2">
      <dt className="text-faint">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
