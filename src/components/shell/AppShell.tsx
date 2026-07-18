"use client";

import { ReactNode } from "react";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";
import { getNavItems } from "@/lib/nav-config";
import { useNavBadges } from "@/lib/use-nav-badges";
import type { SafeUser } from "@/types/auth";

export function AppShell({ user, children }: { user: SafeUser; children: ReactNode }) {
  const navItems = getNavItems(user.role);
  const { unreadMessages, unreadNotifications } = useNavBadges(user.role);
  const hasBottomNav = navItems.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <TopNav user={user} unreadNotifications={unreadNotifications} />
      <main className={hasBottomNav ? "pb-20" : ""}>{children}</main>
      {hasBottomNav && <BottomNav items={navItems} role={user.role} unreadMessages={unreadMessages} />}
    </div>
  );
}
