"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ComingSoon } from "@/components/shell/ComingSoon";
import { UsersTab } from "@/components/admin/tabs/UsersTab";
import { DocumentsTab } from "@/components/admin/tabs/DocumentsTab";
import { PaymentsTab } from "@/components/admin/tabs/PaymentsTab";
import { FlagsTab } from "@/components/admin/tabs/FlagsTab";
import { CategoriesTab } from "@/components/admin/tabs/CategoriesTab";
import { ReviewsTab } from "@/components/admin/tabs/ReviewsTab";
import { AuditTab } from "@/components/admin/tabs/AuditTab";
import { AnalyticsTab } from "@/components/admin/tabs/AnalyticsTab";

const TABS = [
  { key: "users", label: "Users" },
  { key: "documents", label: "Documents" },
  { key: "payments", label: "Payments" },
  { key: "flags", label: "Flags" },
  { key: "categories", label: "Categories" },
  { key: "reviews", label: "Reviews" },
  { key: "analytics", label: "Analytics" },
  { key: "audit", label: "Audit log" },
] as const;

function AdminPanelInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "users";

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="flex gap-1.5 overflow-x-auto px-4 py-3 border-b border-hairline [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => router.push(`/admin/panel?tab=${t.key}`)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              tab === t.key ? "bg-mist text-indigo border-[#93ADE8]" : "border-hairline text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersTab />}
      {tab === "documents" && <DocumentsTab />}
      {tab === "payments" && <PaymentsTab />}
      {tab === "flags" && <FlagsTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "reviews" && <ReviewsTab />}
      {tab === "analytics" && <AnalyticsTab />}
      {tab === "audit" && <AuditTab />}
    </div>
  );
}

export default function AdminPanelPage() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return null;

  if (user.role !== "admin") {
    return <ComingSoon title="Admin panel" blurb="This area is for admin accounts only." />;
  }

  return (
    <Suspense fallback={null}>
      <AdminPanelInner />
    </Suspense>
  );
}
