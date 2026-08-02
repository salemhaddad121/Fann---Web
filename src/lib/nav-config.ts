import type { UserRole } from "@/types/auth";

export interface NavItem {
  href: string;
  label: string;
  icon: string; // Tabler icon name, without the "ti-" prefix
  badge?: "messages"; // which live count (if any) decorates this item
}

// The primary destinations, in the order they appear in the sidebar.
//
// These five are also exactly what the mobile BottomNav renders — seven
// items don't fit across a phone. The two the sidebar adds below them
// (Notifications, Log out) are reachable on mobile from the TopNav bell
// and the account chip respectively, so nothing becomes unreachable.
//
// "Home" is deliberately absent: the dashboard is no longer a nav
// destination, only the landing page behind the wordmark.

// Artist: Search, My Bookings, Messages, Calendar, Profile
// Calendar is where artists block out dates, so it stays in the nav —
// the public profile's availability calendar reads from it.
const ARTIST_NAV: NavItem[] = [
  { href: "/search", label: "Search", icon: "search" },
  { href: "/bookings", label: "My Bookings", icon: "calendar-event" },
  { href: "/messages", label: "Messages", icon: "message-circle", badge: "messages" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/profile", label: "Profile", icon: "user" },
];

// Planner: Search, My Bookings, Messages, Saved, Profile
const PLANNER_NAV: NavItem[] = [
  { href: "/search", label: "Search", icon: "search" },
  { href: "/bookings", label: "My Bookings", icon: "calendar-event" },
  { href: "/messages", label: "Messages", icon: "message-circle", badge: "messages" },
  { href: "/saved", label: "Saved", icon: "heart" },
  { href: "/profile", label: "Profile", icon: "user" },
];

// Admin: none of the mockups (design/screens/12-14) show a bottom nav for
// admin — it's a navbar + a scrollable list of destinations instead.
const ADMIN_NAV: NavItem[] = [];

export function getNavItems(role: UserRole): NavItem[] {
  if (role === "artist") return ARTIST_NAV;
  if (role === "planner") return PLANNER_NAV;
  return ADMIN_NAV;
}

// Where a user lands after signing in — password login, OAuth callback,
// phone verification, and hitting "/" with a live session all funnel
// through here so they can't drift apart.
//
// Artists and bookers land on Search: it's the first thing either side
// actually wants to do, and the dashboard is no longer a nav destination.
// Admins keep going to their own panel, which is a different app surface
// entirely.
export function homePathFor(role: UserRole): string {
  return role === "admin" ? "/admin" : "/search";
}
