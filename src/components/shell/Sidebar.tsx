"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { homePathFor, type NavItem } from "@/lib/nav-config";
import type { SafeUser } from "@/types/auth";

// Hoisted out of Sidebar rather than declared in its body: a component
// created during render is a new component type on every render, so React
// unmounts and remounts the whole nav each time. `pathname` and
// `activeColor` come in as props now instead of via closure.
function NavLink({
  href,
  icon,
  label,
  badge = 0,
  pathname,
  activeColor,
}: {
  href: string;
  icon: string;
  label: string;
  badge?: number;
  pathname: string;
  activeColor: string;
}) {
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
  const { logout } = useAuth();
  const activeColor = user.role === "planner" ? "text-sky" : "text-indigo";
  const avatarBg = user.role === "planner" ? "bg-sky" : "bg-indigo";

  return (
    <aside className="hidden lg:flex flex-col w-60 flex-none sticky top-0 h-screen bg-white border-r border-hairline px-4 py-5">
      <Link href={homePathFor(user.role)} className="font-display text-2xl font-bold text-ink px-2 mb-7">
        fan<span className="text-indigo">n</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            badge={item.badge === "messages" ? unreadMessages : 0}
            pathname={pathname}
            activeColor={activeColor}
          />
        ))}
        <NavLink
          href="/notifications"
          icon="bell"
          label="Notifications"
          badge={unreadNotifications}
          pathname={pathname}
          activeColor={activeColor}
        />
      </nav>

      {/* Account chip, then Log out pinned to the very bottom. Log out
          lives here rather than on the dashboard so it sits in the same
          place on every page. */}
      <div className="mt-auto">
        <Link
          href="/account"
          className="flex items-center gap-2.5 px-2 py-2 rounded-[10px] hover:bg-mist"
        >
          <div className={`w-9 h-9 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-[13px] flex-none`}>
            {user.email.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink truncate">{user.email.split("@")[0]}</div>
            <div className="text-[11px] text-faint capitalize">{user.role}</div>
          </div>
        </Link>

        <button
          onClick={logout}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold text-muted hover:bg-mist hover:text-danger"
        >
          <i className="ti ti-logout text-[19px]" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
