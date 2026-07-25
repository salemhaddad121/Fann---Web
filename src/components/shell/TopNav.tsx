import Link from "next/link";
import type { SafeUser } from "@/types/auth";

function initials(user: SafeUser): string {
  const local = user.email.split("@")[0];
  const parts = local.split(/[._-]/).filter(Boolean);
  const chars = parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2);
  return chars.toUpperCase();
}

export function TopNav({ user, unreadNotifications }: { user: SafeUser; unreadNotifications: number }) {
  const avatarClass =
    user.role === "planner" ? "bg-[#E0F2FE] text-[#075985] border-[#38BDF8]"
    : user.role === "admin" ? "bg-mist text-ink border-hairline"
    : "bg-[#EEF2FE] text-[#1E3A8A] border-[#93ADE8]";

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white border-b border-hairline">
      <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2">
        <span className="font-display text-base font-bold text-ink">
          fan<span className="text-indigo">n</span>
        </span>
        {user.role === "admin" && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]">
            Admin
          </span>
        )}
      </Link>

      <div className="flex items-center gap-2.5">
        <Link
          href="/notifications"
          className="relative w-[34px] h-[34px] rounded-full border border-hairline flex items-center justify-center text-muted"
          aria-label={unreadNotifications > 0 ? `${unreadNotifications} unread notifications` : "Notifications"}
        >
          <i className="ti ti-bell text-[17px]" />
          {unreadNotifications > 0 && (
            <span className="absolute top-[5px] right-[5px] w-[7px] h-[7px] rounded-full bg-[#EF4444] border-[1.5px] border-white" />
          )}
        </Link>
        <Link
          href="/account"
          className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-semibold border ${avatarClass}`}
          aria-label="Account settings"
        >
          {initials(user)}
        </Link>
      </div>
    </div>
  );
}
