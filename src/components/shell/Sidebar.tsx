"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav-config";
import type { SafeUser } from "@/types/auth";

// Desktop-only left nav (hidden below lg). Replaces the mobile TopNav +
// BottomNav at lg+: wordmark, the same nav items, notifications, and an
// account chip at the bottom.
export function Sidebar({
  user,
  items,
  unreadMessages,
  unreadNotifications,
}: {
  user: SafeUser;
  items: NavItem[];
  unreadMessages: number;
  unreadNotifications: number;
}) {
  const pathname = usePathname();
  const activeColor = user.role === "planner" ? "text-sky" : "text-indigo";
  const avatarBg = user.role === "planner" ? "bg-sky" : "bg-indigo";

  function NavLink({ href, icon, label, badge = 0 }: { href: string; icon: string; label: string; badge?: number }) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold ${
          active ? `bg-mist ${activeColor}` : "text-muted hover:bg-mist"
        }`}
      >
        <i className={`ti ti-${icon} text-[19px]`} />
        <span>{label}</span>
        {badge > 0 && (
          <span className="ml-auto bg-[#EF4444] text-white text-[10px] font-semibold min-w-[18px] text-center px-1 rounded-full">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 flex-none sticky top-0 h-screen bg-white border-r border-hairline px-4 py-5">
      <Link href="/dashboard" className="font-display text-2xl font-bold text-ink px-2 mb-7">
        ayn<span className="text-indigo">u</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            badge={item.badge === "messages" ? unreadMessages : 0}
          />
        ))}
        <NavLink href="/notifications" icon="bell" label="Notifications" badge={unreadNotifications} />
      </nav>

      <Link
        href="/account"
        className="mt-auto flex items-center gap-2.5 px-2 py-2 rounded-[10px] hover:bg-mist"
      >
        <div className={`w-9 h-9 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-[13px] flex-none`}>
          {user.email.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-ink truncate">{user.email.split("@")[0]}</div>
          <div className="text-[11px] text-faint capitalize">{user.role}</div>
        </div>
      </Link>
    </aside>
  );
}
