import Link from "next/link";
import type { CategoryGroup } from "@/types/artists";

/**
 * "Start with what you need" — three doors into the search.
 *
 * Each card is one <Link> to /search?categories=<group>, which lands on the
 * masked search page with that group's chip already ticked. There are no
 * per-subcategory landing pages behind these and there should not be: at the
 * current roster most of them would be an empty result with a heading.
 *
 * ONE GROUP PER CARD, and that is not a stylistic choice. The search page
 * models its category filter as `{ group, subs }` — see
 * resolveCategorySelection in src/lib/search-url.ts — so it can hold exactly
 * one group at a time. Hand it leaves from two groups and it silently keeps
 * the first group's and drops the rest: a URL naming twelve leaves across
 * food-beverage, visual and production-technical resolves to Food & Beverage
 * alone and returns "0 artists match your filters". That is why Event
 * Services points at one group rather than at the cross-cutting set of
 * services the name suggests. Logged in ISSUES.md.
 *
 * TAGS ARE PLAIN TEXT, deliberately. They are pill-free, link-free prose
 * describing what is inside the card. Making them links would put six
 * competing destinations on a card whose entire job is to have one.
 *
 * The slugs below are LEAVES, resolved against the live taxonomy at render
 * time rather than written out with their labels — same reason the "Hire
 * from" row does it: a category that gets renamed or retired then drops out
 * of the line instead of advertising something the roster no longer has. The
 * plan's own tag lists named six categories that do not exist here
 * (Inflatables, Party Rentals, Wedding Music, Talaat Oud, Violinists, Wedding
 * Entertainers), which is exactly the failure this avoids.
 */

interface BrowseCard {
  title: string;
  /** Group slug. The href, and the one thing the search page can hold. */
  group: string;
  /** Leaf slugs, editorial order. Resolved to live names; misses are dropped. */
  tags: string[];
  /** Fill. White text and mango both clear 4.5:1 on all three — see below. */
  fill: string;
  image: string;
}

/*
 * Measured, not assumed (white / mango / tags at 82% white, over each fill):
 *
 *   teal   #0F4F4C    9.36   4.79   6.87
 *   plum   #5F2352   11.36   5.81   8.13
 *   indigo #1F2F6B   12.52   6.40   8.97
 *
 * Teal is the tightest and still clears 4.5:1 for the mango footer link at
 * 14px. If a fill is ever changed, re-derive these before shipping it.
 */
const CARDS: BrowseCard[] = [
  {
    title: "Musical Acts",
    group: "music",
    tags: [
      "dj",
      "band-group",
      "singer-vocalist",
      "oud-player",
      "dabke-group",
      "jazz-musician",
      "pianist",
    ],
    fill: "bg-teal",
    image: "/browse/musical-acts.webp",
  },
  {
    title: "Entertainers",
    group: "performance-entertainment",
    tags: [
      "belly-dancer",
      "dancer-dance-group",
      "magician",
      "stand-up-comedian",
      "face-painter",
      "fire-performer",
    ],
    fill: "bg-card-plum",
    image: "/browse/entertainers.webp",
  },
  {
    title: "Event Services",
    group: "food-beverage",
    tags: ["catering", "bartender", "bar-services"],
    fill: "bg-card-indigo",
    image: "/browse/event-services.webp",
  },
];

export function BrowseCategories({ groups }: { groups: CategoryGroup[] }) {
  const nameBySlug = new Map(
    groups.flatMap((g) => g.categories).map((c) => [c.slug, c.name]),
  );
  const liveGroups = new Set(groups.map((g) => g.slug));

  // A card whose group is gone would link to a search with nothing ticked,
  // so it is dropped rather than shipped pointing at a filter that no longer
  // resolves. An empty taxonomy (API down) renders nothing at all.
  const cards = CARDS.filter((c) => liveGroups.has(c.group));
  if (cards.length === 0) return null;

  return (
    <section className="mt-10 rounded-[18px] border border-hairline bg-surface/85 p-6 lg:p-7">
      <h2 className="font-display text-[24px] lg:text-[26px] font-bold text-ink">
        Start with what you need
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        Three doors in. Click a card, land on the search already filtered.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {cards.map((card) => {
          const tags = card.tags.flatMap((slug) => nameBySlug.get(slug) ?? []);
          return (
            <Link
              key={card.group}
              href={`/search?categories=${card.group}`}
              className={`group flex flex-col rounded-[20px] p-7 shadow-[0_2px_0_rgba(30,23,18,0.16)] transition-transform duration-[120ms] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay ${card.fill}`}
            >
              <h3 className="font-display text-[32px] leading-tight text-white">
                {card.title}
              </h3>

              {tags.length > 0 && (
                <p className="mt-2 text-sm leading-[1.65] text-white/[0.82]">
                  {tags.join(" · ")}
                </p>
              )}

              {/* Decorative: the card already names its category in text, so
                  an alt describing the photo would only lengthen a link name
                  that is a heading plus seven tags plus a footer already. */}
              {/* The tag lines wrap to one, two or three lines depending on
                  the category, so the image carries the auto margin: the
                  images bottom-align, the footer rules line up across all
                  three cards, and the slack lands under the tag text where
                  it reads as breathing room instead of as a hole beneath
                  the shortest card. */}
              <div className="mt-auto pt-5">
                {/* eslint-disable-next-line @next/next/no-img-element -- local
                    static asset, already emitted at exactly 2x its slot and
                    lazy; next/image would add an optimizer round trip for it */}
                <img
                  src={card.image}
                  alt=""
                  width={512}
                  height={428}
                  loading="lazy"
                  decoding="async"
                  className="h-[214px] w-full rounded-[14px] object-cover"
                />
              </div>

              <span className="mt-5 flex shrink-0 items-center justify-between border-t border-white/[0.18] pt-4 text-sm font-semibold text-mango">
                <span className="group-hover:underline">
                  Browse {card.title}
                </span>
                <i className="ti ti-arrow-right text-base" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
