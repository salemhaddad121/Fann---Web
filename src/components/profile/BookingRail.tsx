import Link from "next/link";
import type { ArtistDetail } from "@/types/artists";

/**
 * The desktop booking rail.
 *
 * On a 1200px window the profile is a 512px column with ~340px of empty page
 * either side of it, and the only ask on screen is a sticky bar pinned across
 * the bottom. This puts the ask beside the profile instead, where it can carry
 * the price and the reasons rather than one sentence and a button.
 *
 * It REPLACES the sticky bar on lg rather than joining it — a sticky bar plus
 * a rail is two competing asks for one click, and the sticky one wins on
 * position while losing on information. UnlockCta is `lg:hidden` for exactly
 * this reason; if you ever render this rail somewhere else, hide that bar
 * there too.
 *
 * Only for a viewer who is neither the owner nor subscribed: it sells a plan,
 * and there is nothing to sell to someone who has one. That gate lives at the
 * call site, beside the gate on the bar it replaces, so the two cannot drift
 * apart and show both or neither.
 *
 * Contrast: ink on mango 9.05, white on teal 9.36, and the button's 2px ink
 * border is what gives it an edge against the white card — mango on white is
 * 1.96, so without the border the button's boundary would fail SC 1.4.11.
 */

const UNLOCKS = [
  { icon: "ti-user", text: "Their full name and contact details" },
  { icon: "ti-message-circle", text: "Message them directly through Fann" },
  { icon: "ti-cash-off", text: "No booking commissions, ever" },
];

export function BookingRail({ artist }: { artist: ArtistDetail }) {
  // Same source as the "From" stat: the exact figure goes to subscribers
  // only, everyone else gets the band. A rail selling a plan is by
  // definition being read by someone who gets the band.
  const price =
    artist.base_price_usd != null
      ? `$${Number(artist.base_price_usd).toLocaleString()}`
      : artist.base_price_band;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[18px] border border-hairline bg-surface">
        <div className="bg-mango px-5 py-4">
          {price ? (
            <p className="font-display text-[26px] leading-none font-bold text-ink">{price}</p>
          ) : (
            <p className="font-display text-[26px] leading-none font-bold text-ink">
              Price on request
            </p>
          )}
          <p className="mt-1.5 text-[13px] font-semibold text-ink/[0.82]">
            Exact fee shown with a plan
          </p>
        </div>

        <div className="px-5 py-5">
          <ul className="space-y-2.5">
            {UNLOCKS.map(({ icon, text }) => (
              <li key={text} className="flex gap-2.5 text-[13px] leading-snug text-ink-soft">
                <i className={`ti ${icon} mt-px shrink-0 text-base text-clay`} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>

          {/* "from $5" is the day pass, written here rather than fetched —
              same figure and same caveat as UnlockCta's button, and the same
              ISSUES.md line covers both. If the day pass price moves, both
              strings move with it. */}
          <Link
            href="/plans"
            className="mt-5 flex items-center justify-center rounded-[10px] border-2 border-ink bg-mango px-4 py-3 text-sm font-semibold text-ink"
          >
            See plans — from $5
          </Link>
        </div>
      </div>

      {/* Why the name is missing.
          A blurred bar where a name should be reads as a bug unless something
          says otherwise, and the honest answer is also the best argument for
          the plan: the masking is what lets artists list for nothing. */}
      <div className="rounded-[18px] bg-teal px-5 py-4 text-white">
        <p className="text-sm font-semibold">Why is the name hidden?</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/[0.85]">
          Fann shows full names and contact details to members only. It is what stops
          artists being approached around the platform — and it is why listing here
          costs them nothing.
        </p>
      </div>
    </div>
  );
}
