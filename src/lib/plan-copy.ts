import type { PlanCode } from "@/types/subscriptions";

/**
 * The plan names and taglines, in one place.
 *
 * This lives in lib/ rather than beside the cards for a specific reason: it
 * is read by PlanCards ("use client") AND by LandingPlans (a server
 * component). Exporting it from the client module instead does not work —
 * a Server Component importing from a "use client" file gets a client
 * REFERENCE rather than the value, so the lookup silently yields undefined
 * and every plan renders under its bare code ("day" instead of "Day pass").
 * It typechecks and lints clean; it only shows up on the page.
 *
 * A note on the content, because it is not the usual feature matrix: Fann's
 * plans all unlock exactly the same thing. They differ in how long they
 * last, not in what they let you do — hence taglines about who each one
 * suits rather than what each one unlocks.
 */
export const PLAN_COPY: Record<PlanCode, { name: string; tagline: string; featured?: boolean }> = {
  day: {
    name: "Day pass",
    tagline: "For one event you're booking right now.",
  },
  month: {
    name: "Monthly",
    tagline: "For planners with something on every few weeks.",
  },
  year: {
    name: "Yearly",
    tagline: "For venues and agencies booking all year round.",
    featured: true,
  },
};
