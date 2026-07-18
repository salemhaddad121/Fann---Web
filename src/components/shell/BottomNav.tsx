"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav-config";
import type { UserRole } from "@/types/auth";

export function BottomNav({
  items,
  role,
  unreadMessages,
}: {
  items: NavItem[];
  role: UserRole;
  unreadMessages: number;
}) {
  const pathname = usePathname();
  const activeColor = role === "planner" ? "text-sky" : "text-indigo";

  if (items.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] flex bg-white border-t border-hairline">
      {items.map((item) => {
        const active = pathname === item.href;
        const badgeCount = item.badge === "messages" ? unreadMessages : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex-1 flex flex-col items-center justify-center gap-[3px] py-2 pb-2.5 text-[10px] ${
              active ? activeColor : "text-faint"
            }`}
          >
            <i className={`ti ti-${item.icon} text-[20px]`} />
            {item.label}
            {badgeCount > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-18px)] bg-[#EF4444] text-white text-[9px] font-semibold px-1 rounded-lg">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
