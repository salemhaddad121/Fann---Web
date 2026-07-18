"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/auth/Button";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
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
        <p className="text-xs text-muted">
          This is a placeholder home screen — the real {user.role} dashboard
          (from {user.role === "planner" ? "06_booker_dashboard.html" : "05_artist_dashboard.html"}) is next up.
        </p>
      </div>

      <div className="bg-white border border-hairline rounded-2xl p-5 mb-4">
        <p className="text-xs font-semibold text-ink mb-3">Your account</p>
        <dl className="text-sm space-y-2">
          <Row label="Email" value={user.email} />
          <Row label="Role" value={user.role} />
          {user.phone && <Row label="Phone" value={String(user.phone)} />}
          <Row label="Status" value={user.status} />
        </dl>
      </div>

      <Link
        href="/bookings"
        className="flex items-center justify-between bg-white border border-hairline rounded-2xl p-4 mb-4"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${
              user.role === "planner" ? "bg-[#E0F2FE] text-sky" : "bg-mist text-indigo"
            }`}
          >
            <i className="ti ti-calendar-event text-lg" />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">My bookings</div>
            <div className="text-xs text-faint">
              {user.role === "artist" ? "Requests, upcoming, past" : "Track what you've proposed"}
            </div>
          </div>
        </div>
        <i className="ti ti-chevron-right text-faint" />
      </Link>

      {user.phone && !user.phoneVerifiedAt && (
        <Link
          href="/auth/verify-phone"
          className="block mb-4 text-sm font-semibold text-indigo underline"
        >
          Verify your phone number →
        </Link>
      )}

      <Button variant="ghost" onClick={logout}>
        Log out
      </Button>
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
