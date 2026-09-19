import Link from "next/link";
import { unstable_cache } from "next/cache";
import { getCategories } from "@/lib/artists-api";
import type { ArtistSearchResponse } from "@/types/artists";
import { getEventTypes } from "@/lib/planners-api";
import { PublicHeader } from "@/components/search/PublicHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { LandingPlans } from "@/components/landing/LandingPlans";
import { ArtistStrip } from "@/components/landing/ArtistStrip";
import { StoreBadges } from "@/components/landing/StoreBadges";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

// Copy comes from Salem's "Landing Page.docx". Note the deliberate cross-sell:
// the artist section lists the *event* types an artist could get booked for,
// and the planner section lists the *artist* categories they can hire —
// each audience is shown what they'd find on the other side.

/**
 * A chip row.
 *
 * Chips with an `href` render as links. They are pill-shaped, bordered and
 * sit on a card next to real buttons, so the ones that did nothing read as
 * broken controls — and they are the most specific intent signal on the
 * page. /search?categories=<slug> already works; the footer uses it.
 *
 * `href` stays optional because the event-type row has no honest
 * destination: event types describe the PLANNER directory, which a
 * logged-out visitor on /search does not get, so linking them would send
 * someone hunting for weddings into a list of artists.
 */
function Pills({ items }: { items: { label: string; href?: string }[] }) {
  if (items.length === 0) return null;
  const chip =
    "text-[13px] font-semibold text-ink/80 bg-surface/70 border border-hairline rounded-full px-3 py-2";
  return (
    <ul className="flex flex-wrap gap-1.5 mt-4">
      {items.map(({ label, href }) => (
        <li key={label}>
          {href ? (
            <Link href={href} className={`block ${chip} hover:border-clay`}>
              {label}
            </Link>
          ) : (
            <span className={`block ${chip}`}>{label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function JoinNow({ role }: { role: "artist" | "planner" }) {
  return (
    <Link
      href={`/auth/register?role=${role}`}
      className="inline-flex items-center gap-1.5 mt-5 bg-clay-deep text-white text-sm font-semibold px-5 py-2.5 rounded-[10px]"
    >
      JOIN NOW <i className="ti ti-arrow-right text-base" />
    </Link>
  );
}

function NoFees({ freeToUse = false }: { freeToUse?: boolean }) {
  return (
    <p className="mt-3 text-[13px] font-semibold text-success flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="flex items-center gap-1">
        <i className="ti ti-circle-check text-sm" /> No booking commissions
      </span>
      <span className="flex items-center gap-1">
        <i className="ti ti-circle-check text-sm" /> No hidden fees
      </span>
      {freeToUse && (
        <span className="flex items-center gap-1">
          <i className="ti ti-circle-check text-sm" /> Free to use
        </span>
      )}
    </p>
  );
}

/**
 * The taxonomy shown in the two pill rows.
 *
 * Both endpoints are public, so this can run on the server without a
 * session — which is the point: the pills are real content naming every
 * category and event type Fann covers, and fetching them in an effect kept
 * them out of the HTML entirely. Each falls back to an empty list on
 * failure, and Pills renders nothing for an empty list, so a flaky API
 * costs a row rather than the page.
 *
 * Cached per endpoint rather than as a pair, so that per-row fallback
 * survives: caching them together would make either failure cost both rows.
 * The cache is what replaces the route's old `revalidate` — the page reads
 * the TWA cookie now, which makes it dynamic, and without this every view
 * would re-fetch a taxonomy that changes about weekly.
 */
const loadCategories = unstable_cache(getCategories, ["landing-categories"], {
  revalidate: 3600,
});
const loadEventTypes = unstable_cache(getEventTypes, ["landing-event-types"], {
  revalidate: 3600,
});

/**
 * How many artists the button offers to show.
 *
 * Only the count is wanted, so this asks for a single row and reads
 * meta.total rather than pulling the roster twice — ArtistStrip makes its
 * own (verified-only) request for the cards themselves.
 *
 * 0 on failure, and the button falls back to "Browse artists": a label that
 * names a count has to be right, and "Browse all 0 artists" is worse than no
 * number at all.
 */
const loadArtistCount = unstable_cache(
  async () => {
    try {
      const res = await fetch(`${API_URL}/artists?limit=1`, { headers: { "Content-Type": "application/json" } });
      if (!res.ok) return 0;
      const body = (await res.json()) as ArtistSearchResponse;
      return body.meta.total ?? 0;
    } catch {
      return 0;
    }
  },
  ["landing-artist-count"],
  { revalidate: 3600 },
);

async function loadTaxonomy() {
  const [groups, eventTypes] = await Promise.all([
    loadCategories().catch(() => []),
    loadEventTypes().catch(() => []),
  ]);

  const artistCategories = groups
    .flatMap((g) => g.categories)
    .filter((c) => !c.name.toLowerCase().startsWith("other"));

  return { artistCategories, eventTypes };
}

/**
 * The chips the "Hire from" row actually shows.
 *
 * The row used to print the whole leaf taxonomy — 37 equal-weight chips,
 * about two phone screens of them, with no hierarchy and therefore no
 * signal. These ten are the headline categories, listed in editorial order.
 *
 * Editorial, explicitly: there is no booking-volume data to rank by yet, so
 * this is a judgement call written down where it can be argued with, rather
 * than a measurement dressed up as one. Revisit it when there are searches
 * to count.
 *
 * Resolved against the live taxonomy rather than hardcoded with labels, so a
 * slug that is renamed or retired drops out of the row instead of rendering
 * a chip that leads to an empty search.
 */
const HEADLINE_CATEGORY_SLUGS = [
  "dj",
  "photographer",
  "band-group",
  "singer-vocalist",
  "videographer",
  "mc-host",
  "catering",
  "sound-lighting",
  "magician",
  "photo-booth",
];

interface LandingPageProps {
  /**
   * False inside the Play app. Decided at the route so the prices are never
   * serialised into the HTML — see app/page.tsx.
   */
  showPricing?: boolean;
}

export async function LandingPage({ showPricing = true }: LandingPageProps) {
  const [{ artistCategories, eventTypes }, artistCount] = await Promise.all([
    loadTaxonomy(),
    loadArtistCount(),
  ]);

  // Keeps HEADLINE_CATEGORY_SLUGS' order rather than the taxonomy's, so the
  // row reads in the order it was written. A slug with no match is dropped.
  const bySlug = new Map(artistCategories.map((c) => [c.slug, c]));
  const headlineCategories = HEADLINE_CATEGORY_SLUGS.flatMap((slug) => {
    const category = bySlug.get(slug);
    return category
      ? [{ label: category.name, href: `/search?categories=${category.slug}` }]
      : [];
  });

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <PublicHeader />

        <main className="px-5 pb-16 max-w-5xl mx-auto">
          {/* Banner.

              One sentence and one action. This previously ran headline, a
              five-line paragraph, a trust-badge row, a second four-line
              paragraph, and only then the CTA at roughly 510px down — with
              "Join as an Artist" and "Join as a Planner" immediately under
              it. Nine lines of prose and, counting Log in / Sign up, five
              competing actions before a visitor saw a single artist.

              What is left: the headline, one sentence, one filled button.
              The two role CTAs are demoted to the text link below, because
              both roles already get a full JOIN NOW section further down
              this page — they were competing with the browse action for the
              first screen and winning on colour while losing on relevance.

              The button stays the ONLY filled button in the hero. It used to
              be bg-ink next to a saturated clay and a saturated teal, which
              made the no-commitment action the least prominent thing on the
              page. Do not reintroduce a second filled button here. */}
          <section className="pt-10 pb-8 lg:pt-16 lg:pb-10 max-w-3xl">
            <h1 className="font-display text-[30px] leading-[1.15] lg:text-[44px] font-bold text-ink">
              Book Lebanon&apos;s live talent.
            </h1>
            <p className="mt-4 text-[15px] lg:text-base text-ink/80 leading-relaxed">
              DJs, photographers, bands, MCs and more — browse verified profiles,
              compare portfolios and availability, and book direct.
            </p>

            {/* "No account needed." sits beside the button rather than under
                it: it is a caption on the action, not a step after it, and
                below the button it pushed everything past it down a line for
                no reason. It is also the only copy on the page telling a
                stranger they can look around without signing up, which is
                the entire point of the guest tier. */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href="/search"
                className="inline-flex h-14 items-center rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-white"
              >
                {artistCount > 0 ? `Browse all ${artistCount} artists` : "Browse artists"}
              </Link>
              <p className="text-sm text-muted">No account needed.</p>
            </div>

            <p className="mt-4 text-sm">
              <Link href="/auth/register?role=artist" className="font-semibold text-clay-deep">
                Are you a performer? List free →
              </Link>
            </p>
          </section>

          {/* The proof that there is anybody here, directly under the hero
              and above every word of explanation. */}
          <ArtistStrip />

          <div className="pt-10" />

          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            {/* For Artists */}
            <section className="bg-surface/85 border border-hairline rounded-[18px] p-6 lg:p-7">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-clay">
                For Artists
              </span>
              <h2 className="font-display text-[24px] lg:text-[26px] font-bold text-ink mt-1.5">
                A home online for your talent.
              </h2>
              <p className="mt-3 text-sm text-ink/80 leading-relaxed">
                Fann gives you a home online to showcase your talent and get booked. Create a
                profile with your portfolio, set your availability, and let event planners across
                Lebanon find and book you directly.
              </p>
              <p className="mt-3 text-sm text-ink/80 leading-relaxed">
                Fann puts your work in front of the people who need it, when they need it.
              </p>
              <NoFees freeToUse />
              <p className="mt-5 text-xs font-semibold text-faint uppercase tracking-wide">
                Get booked for
              </p>
              {/* No href — see Pills. */}
              <Pills items={eventTypes.map((label) => ({ label }))} />
              <JoinNow role="artist" />
            </section>

            {/* For Planners */}
            <section className="bg-surface/85 border border-hairline rounded-[18px] p-6 lg:p-7">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-teal">
                For Planners
              </span>
              <h2 className="font-display text-[24px] lg:text-[26px] font-bold text-ink mt-1.5">
                Beyond your own network.
              </h2>
              <p className="mt-3 text-sm text-ink/80 leading-relaxed">
                Fann takes you out of your immediate network of talent and provides you with a
                vast directory of performing artists and event services.
              </p>
              <p className="mt-3 text-sm text-ink/80 leading-relaxed">
                Search verified artists — DJs, photographers, bands, MCs, and much more — compare
                portfolios and availability, and book with confidence, all in one place. From
                weddings to corporate events.
              </p>
              <p className="mt-3 text-sm text-ink/80 leading-relaxed">
                Find the right performer without endless phone calls, referrals, and endless
                searching on Instagram.
              </p>
              <p className="mt-5 text-xs font-semibold text-faint uppercase tracking-wide">
                Hire from
              </p>
              <Pills items={headlineCategories} />
              {artistCategories.length > headlineCategories.length && (
                <p className="mt-3 text-[13px]">
                  <Link href="/search" className="font-semibold text-clay-deep">
                    See all {artistCategories.length} categories →
                  </Link>
                </p>
              )}
              <JoinNow role="planner" />
            </section>
          </div>

          {/* Pricing. Sits after both role sections because it only applies
              to one of them — an artist reading down the page is told twice
              that listing is free before a price appears. */}
          {showPricing && <LandingPlans />}

          {/* Mid-page store badges, driven by the same config as the footer
              so there is one place to fill in the URLs when the apps ship. */}
          <section className="mt-5 rounded-[18px] border border-hairline bg-surface/85 p-6 lg:p-7">
            <StoreBadges heading="Fann on mobile" />
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
