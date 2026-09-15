import { unstable_cache } from "next/cache";
import { listPlans } from "@/lib/subscriptions-api";
import { PlanCards } from "@/components/plans/PlanCards";

/**
 * The pricing block on the landing page.
 *
 * ⚠️ This section must never render inside the Play app. It is gated at the
 * route — see the TWA check in app/page.tsx — not here, because the guarantee
 * has to be that the prices are never in the HTML at all. /plans makes the
 * same call for the same reason.
 *
 * The cards are the ones from /plans, deliberately: one component means one
 * place where a price, a cap or the wording can drift out of sync. The
 * difference is the call to action — there is no purchase flow on the landing
 * page, so each card links to /plans rather than starting a payment.
 *
 * Prices are read from the API rather than written here, so a change in
 * subscription_plans moves this section without a deploy.
 */

// The route is dynamic (it reads the TWA cookie), so without this every
// landing-page view would hit the API for a price list that changes about
// never. Caching here rather than at the route keeps the hourly refresh the
// page had while it was static.
const loadPlans = unstable_cache(listPlans, ["landing-plans"], { revalidate: 3600 });

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

      <div className="mt-6">
        <PlanCards plans={plans} ctaHref="/plans" ctaLabel="Get started" />
      </div>

      {/* The honest framing, and the reason these cards are not a feature
          matrix: all three plans unlock the same thing. */}
      <p className="mt-4 text-xs text-faint">
        Every plan unlocks the same thing — they differ in how long they last.
      </p>
    </section>
  );
}
