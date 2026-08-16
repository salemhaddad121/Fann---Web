import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, Section, Points, CallToAction } from "@/components/marketing/MarketingPage";

export const metadata: Metadata = {
  title: "Pricing your work",
  description:
    "How to set a rate as a performer in Lebanon: what to include, how deposits and cancellation terms work, and how your listed price is shown to planners on Fann.",
  alternates: { canonical: "/for-artists/pricing-your-work" },
  openGraph: {
    url: "/for-artists/pricing-your-work",
    title: "Pricing your work",
    description:
      "Setting a rate, what to include, and how deposits and cancellation terms work.",
  },
};

export default function PricingYourWorkPage() {
  return (
    <MarketingPage
      title="Pricing your work"
      lead="Pricing is the part most performers get wrong in the same direction. This page will not tell you what to charge — nobody sensible can, from outside — but it can tell you what to account for and how your number is shown on Fann."
    >
      <Section title="How your price appears">
        <p>
          The price on your profile is a starting rate, shown as &ldquo;from&rdquo;.
          Planners who have not subscribed see it as a band rather than an exact
          figure, so they can judge whether you are in budget without you
          having to publish a precise number to the open internet.
        </p>
        <p>
          The point is that nobody wastes anybody&apos;s time. A planner with a
          $300 budget can see immediately that a $1,200 act is not for this
          event, and neither of you spends a message finding that out.
        </p>
      </Section>

      <Section title="Price the whole job, not the stage time">
        <p>
          The most common underpricing mistake is quoting for the hours you are
          performing. The actual cost of a booking includes everything around
          it:
        </p>
        <Points
          items={[
            "Travel, and what it costs to get equipment there and back.",
            "Setup and teardown, which for anything with a PA is often longer than the set.",
            "Rehearsal or preparation specific to that event.",
            "Equipment — what you own, what you hire, what wears out.",
            "Anyone else you pay: a second player, a driver, a technician.",
            "The dates you turned down because you held this one.",
          ]}
        />
        <p>
          A two-hour set is rarely two hours of work. Pricing as though it is
          means the busiest month of your year can still lose money.
        </p>
      </Section>

      <Section title="Different events, different numbers">
        <p>
          A wedding, a corporate evening and a bar slot are not the same job
          and generally should not carry the same rate. Weddings run long, move
          to their own schedule and carry the highest expectations. Corporate
          bookings usually have the most defined brief and the most reliable
          payment. Venue slots pay less per night and are worth more over a
          year, because they repeat.
        </p>
        <p>
          Your listed price is a starting point for the cheapest of these. Quote
          the specific event when you reply to an enquiry.
        </p>
      </Section>

      <Section title="Deposits and cancellation">
        <p>
          Both are fields on your profile and both are visible to everyone,
          subscribed or not. A deposit is what makes a booking real; without
          one, a held date is only an intention, and you find out it was only
          an intention at the point when the date can no longer be resold.
        </p>
        <p>
          Set a cancellation policy you will apply. Performers routinely write
          a firm one and then waive it, which teaches planners the terms are
          decorative. A modest policy you enforce protects you more than a
          strict one you do not.
        </p>
        <p>
          Fann does not collect or hold either. Deposits are arranged directly
          between you and the planner, which is also why writing the terms down
          in your messages matters — see{" "}
          <Link
            href="/trust-and-safety"
            className="font-semibold text-clay-deep underline"
          >
            trust &amp; safety
          </Link>
          .
        </p>
      </Section>

      <Section title="Raising your rate">
        <p>
          The signal to raise is being booked for nearly everything you are
          asked about. A performer accepting every enquiry at the current
          number is, by definition, priced below what the market will pay.
        </p>
        <p>
          Raise it on new enquiries rather than on people you already have a
          relationship with, and let the profile catch up once the higher
          number is being accepted.
        </p>
      </Section>

      <Section title="What Fann takes">
        <p>
          Nothing. There is no commission on bookings and no fee for listing —
          the fee you agree with a planner is the fee you receive, paid
          directly to you. So the number you set is not a number to inflate to
          cover a platform cut.
        </p>
      </Section>

      <CallToAction
        heading="See where your rate sits"
        body="Browse your own category in the directory and look at how comparable performers have priced themselves. It is the only local benchmark that actually exists."
        href="/search"
        label="Browse the directory"
      />
    </MarketingPage>
  );
}
