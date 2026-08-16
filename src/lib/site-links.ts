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
    // Two entries by design. Careers and Press were cut permanently: a
    // careers page with no jobs and a press page with no coverage each read
    // worse than no link at all.
    heading: "Company",
    links: [
      { label: "About Fann", href: "/about" },
      { label: "How it works", href: "/how-it-works" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help centre", href: "/help" },
      { label: "Contact us", href: "/help" },
      { label: "Trust & safety", href: "/trust-and-safety" },
      // Points at /help rather than a page of its own: reporting a problem
      // and contacting support are the same form and the same inbox, and a
      // separate page would only be a second door to it.
      { label: "Report a problem", href: "/help" },
    ],
  },
  {
    // /for-artists/*, not /artists/*. A literal segment does beat a dynamic
    // one in Next's matcher, so /artists/resources would resolve — but it
    // would sit one new artist slug away from a collision, and /artists/[id]
    // should keep meaning "an artist profile".
    heading: "Talent",
    links: [
      { label: "Join as an artist", href: "/auth/register?role=artist" },
      { label: "Artist resources", href: "/for-artists/resources" },
      { label: "Getting booked", href: "/for-artists/getting-booked" },
      { label: "Pricing your work", href: "/for-artists/pricing-your-work" },
    ],
  },
  {
    heading: "Planners",
    links: [
      { label: "Join as a planner", href: "/auth/register?role=planner" },
      { label: "Browse artists", href: "/search" },
      { label: "Plans & pricing", href: "/plans" },
      { label: "Planning a wedding", href: "/planning-a-wedding" },
    ],
  },
  {
    heading: "Services",
    links: [
      // Slugs must match the categories seeded in migration 005 exactly —
      // "band" and "mc" are not slugs, and pointed at an empty result set,
      // which reads as "Fann has no bands" rather than as a broken link.
      { label: "DJs", href: "/search?categories=dj" },
      { label: "Photographers", href: "/search?categories=photographer" },
      { label: "Bands", href: "/search?categories=band-group" },
      { label: "MCs & hosts", href: "/search?categories=mc-host" },
    ],
  },
  {
    heading: "Entertainment",
    links: [
      { label: "Weddings", href: "/weddings" },
      { label: "Corporate events", href: "/corporate-events" },
      { label: "Private parties", href: "/private-parties" },
      { label: "Venues", href: "/venues" },
    ],
  },
];

/**
 * Legal links, shown on their own row below the columns.
 *
 * "Notice at Collection" was cut permanently and should not be reinstated.
 * It is a California CCPA artifact — it appears on US marketplaces because
 * they have Californian users. Fann is Lebanese, serves Lebanese businesses
 * and excludes individual consumers by design, so publishing one would
 * advertise rights there is no process to honour.
 */
export const LEGAL_LINKS: SiteLink[] = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
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
