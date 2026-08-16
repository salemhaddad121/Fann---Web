"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getAdminStats, getAuditLog } from "@/lib/admin-api";
import { formatRelativeTime } from "@/lib/format";
import { ComingSoon } from "@/components/shell/ComingSoon";
import type { AdminStats, AuditLogEntry } from "@/types/admin";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function sumBy(rows: AdminStats["users"], pred: (r: AdminStats["users"][number]) => boolean) {
  return rows.filter(pred).reduce((sum, r) => sum + Number(r.count), 0);
}

const AUDIT_DOTS: Record<string, string> = {
  approved: "bg-[#22C55E]",
  confirmed: "bg-[#22C55E]",
  rejected: "bg-[#EF4444]",
  banned: "bg-[#EF4444]",
  suspended: "bg-[#F59E0B]",
  dismissed: "bg-[#a89680]",
  actioned: "bg-[#EF4444]",
  created: "bg-[#22C55E]",
  deleted: "bg-[#EF4444]",
  removed: "bg-[#EF4444]",
};

function auditDot(action: string) {
  const suffix = action.split(".").pop() ?? "";
  return AUDIT_DOTS[suffix] ?? "bg-[#a89680]";
}

function auditSentence(entry: AuditLogEntry): string {
  const [subject, verb] = entry.action.split(".");
  const subjectLabel: Record<string, string> = {
    user: "User",
    id_doc: "ID document",
    payment: "Payment",
    flag: "Flag",
    category: "Category",
    category_group: "Category group",
    review: "Review",
  };
  return `${subjectLabel[subject] ?? subject} ${verb}`;
}

function QueueRow({
  icon,
  iconBg,
  iconFg,
  title,
  subtitle,
  count,
  countStyle,
  href,
}: {
  icon: string;
  iconBg: string;
  iconFg: string;
  title: string;
  subtitle: string;
  count?: number;
  countStyle?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-surface border border-hairline rounded-xl px-3.5 py-3"
    >
      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0 ${iconBg} ${iconFg}`}>
        <i className={`ti ${icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink">{title}</div>
        <div className="text-xs text-muted">{subtitle}</div>
      </div>
      {count !== undefined && (
        <span className={`min-w-[24px] h-6 rounded-xl flex items-center justify-center text-xs font-bold px-1.5 shrink-0 ${countStyle}`}>
          {count}
        </span>
      )}
      <i className="ti ti-chevron-right text-faint shrink-0" />
    </Link>
  );
}

function AdminHome({ userName }: { userName: string }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAdminStats(), getAuditLog(1)])
      .then(([s, log]) => {
        if (cancelled) return;
        setStats(s);
        setActivity(log.data.slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the admin dashboard.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!stats || !activity) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  const totalArtists = sumBy(stats.users, (r) => r.role === "artist");
  const totalPlanners = sumBy(stats.users, (r) => r.role === "planner");
  const pendingAccounts = sumBy(stats.users, (r) => r.status === "pending_review");
  const totalUsers = sumBy(stats.users, () => true);

  return (
    <div className="max-w-lg lg:max-w-3xl mx-auto pb-8">
      <div className="p-4 border-b border-hairline">
        <h1 className="text-[17px] font-bold text-ink mb-0.5">
          {greeting()}, {userName}
        </h1>
        <p className="text-xs text-muted">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          {" · "}
          {stats.pendingIdDocuments + stats.pendingPayments + stats.openFlags} item
          {stats.pendingIdDocuments + stats.pendingPayments + stats.openFlags === 1 ? "" : "s"} need
          your attention
        </p>
      </div>

      <div className="p-4">
        <p className="text-[13px] font-bold text-ink mb-2.5">Platform overview</p>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <StatCard icon="ti-users" bg="bg-sand" fg="text-clay" value={totalArtists} label="Total artists" />
          <StatCard icon="ti-building-community" bg="bg-[#dfeceb]" fg="text-teal" value={totalPlanners} label="Total planners" />
          <StatCard icon="ti-user-exclamation" bg="bg-[#FEF3C7]" fg="text-[#92400E]" value={pendingAccounts} label="Pending accounts" />
          <StatCard icon="ti-flag" bg="bg-[#FEF2F2]" fg="text-danger" value={stats.openFlags} label="Open flags" />
        </div>

        <p className="text-[13px] font-bold text-ink mb-2.5">Action queues</p>
        <div className="flex flex-col gap-2 mb-5">
          <QueueRow
            icon="ti-user-check"
            iconBg="bg-sand"
            iconFg="text-clay"
            title="Pending approvals"
            subtitle="Artists and planners awaiting ID review"
            count={stats.pendingIdDocuments}
            countStyle="bg-[#FEF2F2] text-danger"
            href="/admin/panel?tab=documents"
          />
          <QueueRow
            icon="ti-credit-card"
            iconBg="bg-[#dfeceb]"
            iconFg="text-teal"
            title="Payments queue"
            subtitle="Planner payments awaiting confirmation"
            count={stats.pendingPayments}
            countStyle="bg-[#FEF3C7] text-[#92400E]"
            href="/admin/panel?tab=payments"
          />
          <QueueRow
            icon="ti-flag"
            iconBg="bg-[#FEF2F2]"
            iconFg="text-danger"
            title="Flags queue"
            subtitle="Reported profiles, messages, conversations"
            count={stats.openFlags}
            countStyle="bg-[#FEF2F2] text-danger"
            href="/admin/panel?tab=flags"
          />
          <QueueRow
            icon="ti-users"
            iconBg="bg-sand"
            iconFg="text-muted"
            title="User management"
            subtitle="All artists, planners, and account status"
            count={totalUsers}
            countStyle="bg-sand text-clay"
            href="/admin/panel?tab=users"
          />
          <QueueRow
            icon="ti-category"
            iconBg="bg-[#DCFCE7]"
            iconFg="text-success"
            title="Categories"
            subtitle="Groups and categories artists list themselves under"
            href="/admin/panel?tab=categories"
          />
          <QueueRow
            icon="ti-star"
            iconBg="bg-sand"
            iconFg="text-clay"
            title="Reviews"
            subtitle="Moderate visible reviews"
            href="/admin/panel?tab=reviews"
          />
          <QueueRow
            icon="ti-chart-bar"
            iconBg="bg-[#dfeceb]"
            iconFg="text-teal"
            title="Analytics"
            subtitle="Signups over time and top cities"
            href="/admin/panel?tab=analytics"
          />
          <QueueRow
            icon="ti-clipboard-list"
            iconBg="bg-sand"
            iconFg="text-muted"
            title="Audit log"
            subtitle="Full history of admin actions"
            href="/admin/panel?tab=audit"
          />
        </div>

        <p className="text-[13px] font-bold text-ink mb-2.5">Recent activity</p>
        {activity.length === 0 ? (
          <p className="text-sm text-faint">No admin actions yet.</p>
        ) : (
          <div className="bg-surface border border-hairline rounded-xl overflow-hidden">
            {activity.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-hairline last:border-b-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${auditDot(entry.action)}`} />
                <span className="flex-1 text-xs text-ink">
                  {auditSentence(entry)}
                  {entry.note && <span className="text-faint"> — {entry.note}</span>}
                </span>
                <span className="text-[11px] text-faint shrink-0">{formatRelativeTime(entry.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  bg,
  fg,
  value,
  label,
}: {
  icon: string;
  bg: string;
  fg: string;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-surface border border-hairline rounded-xl p-3.5">
      <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-base mb-2 ${bg} ${fg}`}>
        <i className={`ti ${icon}`} />
      </div>
      <div className="text-2xl font-bold text-ink">{value.toLocaleString()}</div>
      <div className="text-[11px] text-faint">{label}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return null;

  if (user.role !== "admin") {
    return <ComingSoon title="Admin dashboard" blurb="This area is for admin accounts only." />;
  }

  return <AdminHome userName={user.email.split("@")[0]} />;
}
