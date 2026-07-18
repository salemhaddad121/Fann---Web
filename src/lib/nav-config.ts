import type { UserRole } from "@/types/auth";

export interface NavItem {
  href: string;
  label: string;
  icon: string; // Tabler icon name, without the "ti-" prefix
  badge?: "messages"; // which live count (if any) decorates this item
}

// Artist: Home, Search, Messages, Calendar, Profile
const ARTIST_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/search", label: "Search", icon: "search" },
  { href: "/messages", label: "Messages", icon: "message-circle", badge: "messages" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/profile", label: "Profile", icon: "user" },
];

// Planner: Home, Search, Messages, Saved, Profile
const PLANNER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/search", label: "Search", icon: "search" },
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
