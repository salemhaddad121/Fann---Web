/**
 * Every link in the footer and the app-store badges, in one place.
 *
 * The point of the indirection: most of these destinations do not exist
 * yet. Keeping them here means filling one in later is a one-line change to
 * a config object rather than an edit to JSX, and `href: null` is what
 * marks "planned but not built" — those render as plain text rather than as
 * links to a 404, which is worse than not linking at all.
 */

export interface SiteLink {
  label: string;
  /** null renders as unlinked text — the page does not exist yet. */
  href: string | null;
}

export interface FooterColumn {
  heading: string;
  links: SiteLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Company",
    links: [
      { label: "About Fann", href: null },
      { label: "How it works", href: null },
      { label: "Careers", href: null },
      { label: "Press", href: null },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help centre", href: "/help" },
      { label: "Contact us", href: "/help" },
      { label: "Trust & safety", href: null },
      { label: "Report a problem", href: null },
    ],
  },
  {
    heading: "Talent",
    links: [
      { label: "Join as an artist", href: "/auth/register?role=artist" },
      { label: "Artist resources", href: null },
      { label: "Getting booked", href: null },
      { label: "Pricing your work", href: null },
    ],
  },
  {
    heading: "Planners",
    links: [
      { label: "Join as a planner", href: "/auth/register?role=planner" },
      { label: "Browse artists", href: "/search" },
      { label: "Plans & pricing", href: "/plans" },
      { label: "Planning a wedding", href: null },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "DJs", href: "/search?categories=dj" },
      { label: "Photographers", href: "/search?categories=photographer" },
      { label: "Bands", href: "/search?categories=band" },
      { label: "MCs & hosts", href: "/search?categories=mc" },
    ],
  },
  {
    heading: "Entertainment",
    links: [
      { label: "Weddings", href: null },
      { label: "Corporate events", href: null },
      { label: "Private parties", href: null },
      { label: "Venues", href: null },
    ],
  },
];

/** Legal links, shown on their own row below the columns. */
export const LEGAL_LINKS: SiteLink[] = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  // Named as the spec asks. Not yet written — unlinked rather than pointed
  // at a 404, since a broken link to a privacy notice is worse than none.
  { label: "Notice at Collection", href: null },
];

export interface SocialLink {
  label: string;
  /** Tabler icon name, without the "ti-" prefix. */
  icon: string;
  href: string | null;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", icon: "brand-instagram", href: null },
  { label: "Facebook", icon: "brand-facebook", href: null },
  { label: "TikTok", icon: "brand-tiktok", href: null },
  { label: "YouTube", icon: "brand-youtube", href: null },
];

export interface StoreBadge {
  label: string;
  sublabel: string;
  icon: string;
  href: string | null;
}

/**
 * App store badges.
 *
 * href is null because neither app exists yet. They render disabled with a
 * "coming soon" affordance rather than linking nowhere — the spec asks for
 * the badges, and showing them as live links to nothing would be a promise
 * the product cannot keep.
 */
export const STORE_BADGES: StoreBadge[] = [
  { label: "Download on the", sublabel: "App Store", icon: "brand-apple", href: null },
  { label: "Get it on", sublabel: "Google Play", icon: "brand-google-play", href: null },
];
