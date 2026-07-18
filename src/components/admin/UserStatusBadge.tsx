import type { UserStatus } from "@/types/admin";

const STYLES: Record<UserStatus, string> = {
  pending_review: "bg-[#FEF3C7] text-[#92400E]",
  active: "bg-[#DCFCE7] text-[#166534]",
  suspended: "bg-[#FEF3C7] text-[#92400E]",
  banned: "bg-[#FEF2F2] text-[#7F1D1D]",
};

const LABELS: Record<UserStatus, string> = {
  pending_review: "Pending",
  active: "Active",
  suspended: "Suspended",
  banned: "Banned",
};

export function UserStatusBadge({ status, deletedAt }: { status: UserStatus; deletedAt?: string | null }) {
  if (deletedAt) {
    return (
      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[#334155]">
        Deleted
      </span>
    );
  }
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
