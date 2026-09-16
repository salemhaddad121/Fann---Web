import Link from "next/link";
import { unstable_cache } from "next/cache";
import { listPlans } from "@/lib/subscriptions-api";
import { PLAN_COPY } from "@/lib/plan-copy";
import type { SubscriptionPlan } from "@/types/subscriptions";

/**
 * The pricing block on the landing page.
 *
 * ⚠️ This section must never render inside the Play app. It is gated at the
 * route — see the TWA check in app/page.tsx — not here, because the guarantee
 * has to be that the prices are never in the HTML at all. /plans makes the
 * same call for the same reason.
 *
 * A summary, not a copy of /plans. This used to render the full PlanCards
 * grid: three complete cards, twenty-one feature rows, every one of which
 * /plans repeats verbatim one click later. On a page whose job is to get
 * someone looking at artists, that was a pricing page wedged into a landing
 * page. What is left is the shape of the offer — three names, three prices,
 * one line each — and a link to the page that owns the detail.
 *
 * The lines are DERIVED from the plan rows rather than written here, so a
 * price, a duration or a message cap changing in the database moves this
 * block without a deploy and without anyone remembering it exists. Only the
 * plan names are shared copy, imported from lib/plan-copy.ts so there is one
 * spelling of "Day pass" on the site. That module is deliberately NOT inside
 * PlanCards: a server component importing a const from a "use client" file
 * receives a client reference rather than the value, and every plan then
 * renders under its bare code.
 *
 * Prices are read from the API rather than written here, so a change in
 * subscription_plans moves this section without a deploy.
 */

// The route is dynamic (it reads the TWA cookie), so without this every
// landing-page view would hit the API for a price list that changes about
// never. Caching here rather than at the route keeps the hourly refresh the
// page had while it was static.
const loadPlans = unstable_cache(listPlans, ["landing-plans"], { revalidate: 3600 });

/**
 * The one line under each price.
 *
 * Names the three things that actually differ between the plans — how long
 * it lasts, whether messages are capped, and whether ID is required. Fann's
 * plans unlock exactly the same thing otherwise, and inventing a
 * differentiator to fill the line would be a claim the product does not
 * back up.
 */
function summarise(plan: SubscriptionPlan): string {
  const duration = plan.code === "day" ? "24 hours" : `${plan.duration_days} days`;
  const messages =
    plan.message_cap === null ? "unlimited messages" : `up to ${plan.message_cap} messages`;
  const id = plan.requires_id_doc ? ", ID required" : "";
  return `${duration}, ${messages}${id}`;
}

export async function LandingPlans() {
  // A failure is not cached — the section is dropped for this render and the
  // next one tries again. Losing the pricing block costs less than a landing
  // page that will not render.
  const plans = await loadPlans().catch(() => []);
  if (plans.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-[22px] lg:text-[26px] font-bold text-ink">
        Plans &amp; pricing
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-ink/80 leading-relaxed">
        Artists list on Fann for free and are never charged. Planners subscribe to
        unlock artist names, contact details and direct messaging — with no booking
        commissions on top.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className="rounded-[14px] border border-hairline bg-surface/85 px-4 py-3.5"
          >
            <p className="text-[13px] font-bold uppercase tracking-wide text-clay-deep">
              {PLAN_COPY[plan.code]?.name ?? plan.code}
            </p>
            <p className="mt-1 text-[22px] font-bold leading-tight text-ink">
              ${plan.price_usd}
            </p>
            <p className="mt-1 text-[13px] text-muted">{summarise(plan)}</p>
          </div>
        ))}
      </div>

      {/* Keep this pointing at /plans: the CSS rule that hides pricing links
          inside the Play app matches on the href, so a link anywhere else
          would walk straight past it. */}
      <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <Link href="/plans" className="font-semibold text-clay-deep">
          Compare plans in full →
        </Link>
        {/* The honest framing, and the reason these are not a feature matrix:
            all three plans unlock the same thing. */}
        <span className="text-[13px] text-muted">
          Every plan unlocks the same thing — they differ in how long they last.
        </span>
      </p>
    </section>
  );
}
