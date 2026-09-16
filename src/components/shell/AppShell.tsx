"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";
import { Sidebar } from "@/components/shell/Sidebar";
import { PageBackground } from "@/components/shell/PageBackground";
import { PageTiming } from "@/components/shell/PageTiming";
import { FloatingLogout } from "@/components/shell/FloatingLogout";
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
  // /account carries a real "Log out" row of its own, so the floating
  // fallback stands down there. Without this the two land on top of each
  // other at 390px — literally overlapping rectangles saying the same word.
  const pageHasOwnLogout = usePathname() === "/account";
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

        {/* Logout lives at the foot of the Sidebar, and the Sidebar is
            lg:-only — so below that breakpoint nobody could sign out, on a
            product whose primary surface is a phone. Two cases, and they
            need different positions:

            Admin has no sidebar at any width, so its button is the only
            logout there is and sits in the corner.

            Artists and planners have the sidebar from lg up; below that the
            floating button stands in for it, raised to clear the BottomNav
            it would otherwise sit on top of. Only on shells that show that
            nav — a sidebar-only page (the message thread) owns the bottom of
            the screen for its composer, and a logout pill over it would be
            worse than the problem.

            /account carries a plain Log out control for every role, which is
            where people actually look — and where this fallback suppresses
            itself, so the two never overlap. */}
        {!hasNav && !pageHasOwnLogout && <FloatingLogout />}
        {hasNav && showMobileNav && !pageHasOwnLogout && (
          <FloatingLogout placement="above-nav" />
        )}
      </div>
    </div>
  );
}

