"use client";

import { ReactNode } from "react";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";
import { Sidebar } from "@/components/shell/Sidebar";
import { PageBackground } from "@/components/shell/PageBackground";
import { PageTiming } from "@/components/shell/PageTiming";
import { getNavItems } from "@/lib/nav-config";
import { useNavBadges } from "@/lib/use-nav-badges";
import type { SafeUser } from "@/types/auth";

export function AppShell({
  user,
  children,
  background,
  chrome = "full",
}: {
  user: SafeUser;
  children: ReactNode;
  // Which side's background to show. Defaults to the logged-in user's own
  // role — a planner viewing their own dashboard gets the booker
  // background. Pages about a *specific* profile (e.g. an artist's public
  // page) pass this explicitly instead, so it stays tied to whose profile
  // is being viewed rather than who's currently logged in.
  background?: "artist" | "planner";
  // "sidebar-only" keeps the desktop sidebar but drops the mobile top and
  // bottom bars. For full-height pages that own the bottom of the screen —
  // the message thread's composer sits exactly where BottomNav would.
  chrome?: "full" | "sidebar-only";
}) {
  const navItems = getNavItems(user.role);
  const { unreadMessages, unreadNotifications } = useNavBadges(user.role);
  const hasNav = navItems.length > 0;
  const showMobileNav = chrome === "full";
  const resolvedBackground = background ?? (user.role === "planner" ? "planner" : "artist");

  return (
    <div className="min-h-screen relative">
      <PageBackground role={resolvedBackground} />
      {/* Engagement telemetry — logged-in pages only, so every event has a
          role attached. Renders nothing. */}
      <PageTiming />
      <div className="relative z-10 lg:flex lg:items-start">
        {/* Desktop sidebar — replaces the top + bottom nav at lg+ */}
        {hasNav && (
          <Sidebar
            user={user}
            items={navItems}
            unreadMessages={unreadMessages}
            unreadNotifications={unreadNotifications}
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Top bar: mobile-only when there's a sidebar; always for admin (no sidebar) */}
          {showMobileNav && (
            <div className={hasNav ? "lg:hidden" : ""}>
              <TopNav user={user} unreadNotifications={unreadNotifications} />
            </div>
          )}
          <main className={hasNav && showMobileNav ? "pb-20 lg:pb-6" : ""}>{children}</main>
          {hasNav && showMobileNav && (
            <div className="lg:hidden">
              <BottomNav items={navItems} role={user.role} unreadMessages={unreadMessages} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

