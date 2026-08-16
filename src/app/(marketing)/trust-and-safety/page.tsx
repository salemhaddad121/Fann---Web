import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, Section, Points, CallToAction } from "@/components/marketing/MarketingPage";

export const metadata: Metadata = {
  title: "Trust & safety",
  description:
    "How Fann reviews artist profiles, what the verified badge means, how to report a problem, and what Fann is and is not responsible for in a booking.",
  alternates: { canonical: "/trust-and-safety" },
  openGraph: {
    url: "/trust-and-safety",
    title: "Trust & safety",
    description:
      "How profiles are reviewed, what the verified badge means, and what Fann is and is not responsible for.",
  },
};

/**
 * ⚠️ Accuracy matters more here than anywhere else on the site.
 *
 * This is the page someone opens before spending money, so every claim on
 * it was checked against the code rather than written from the plan:
 *
 *   - Admin review before a profile is public IS real. Registration sets
 *     users.status to 'pending_review' and the public artist query requires
 *     u.status = 'active', so a profile cannot be found until a person moves
 *     it across.
 *   - The verified badge is a separate admin flag (is_verified) and is NOT a
 *     gate — verifiedOnly is an optional search filter, so unverified
 *     artists do appear. Saying "all artists are verified" would be false.
 *   - Identity documents can be uploaded and reviewed, with retention rules,
 *     but they are not currently required before an artist goes live. The
 *     page does not claim they are.
 *   - There is no per-profile report button. No user-facing flag endpoint
 *     exists — only /admin/flags. Reporting genuinely happens through the
 *     support form, so that is what this describes.
 */
export default function TrustAndSafetyPage() {
  return (
    <MarketingPage
      title="Trust & safety"
      lead="Fann is a place to find and talk to performers. Being straight about where that responsibility ends matters more than sounding reassuring, so this page describes what actually happens rather than what would read best."
    >
      <Section title="Every profile is reviewed before it is public">
        <p>
          A new account is not visible in search when it is created. It sits in
          a review queue, and someone at Fann looks at the profile before it
          appears in the directory. Accounts that are obviously fake,
          duplicated, or not offering a real service do not get through.
        </p>
        <p>
          This is a human check on plausibility, not a background check. It
          catches the accounts that should never have been listed. It does not
          tell you whether a particular performer will be good at your event —
          the portfolio, the terms and the conversation are for that.
        </p>
      </Section>

      <Section title="What the verified badge means">
        <p>
          Some profiles carry a verified badge. It is applied by an
          administrator and means Fann has done additional checking on that
          specific artist beyond the initial review.
        </p>
        <p>
          Two things worth being clear about. The badge is not automatic and
          not universal — most artists on Fann are legitimately listed without
          one, and its absence is not a warning. And it is not a guarantee of
          performance, insurance, or anything about a booking; it is a
          statement about identity and standing, not about outcome. You can
          filter search to verified artists only if you would rather start
          there.
        </p>
      </Section>

      <Section title="What Fann is not">
        <p>
          Fann is not a party to your booking. When you agree a fee and a date
          with an artist, that agreement is between the two of you. Fann does
          not sign it, does not guarantee it, and is not a route of recourse
          if it goes wrong.
        </p>
        <p>
          Fann also does not handle the money. Payments for bookings are made
          directly between planner and artist — Fann takes no commission and
          never holds funds, so there is no escrow, no chargeback and no
          refund mechanism through the platform. The only thing Fann charges
          for is the planner subscription.
        </p>
        <Points
          items={[
            "No commission is taken from any booking.",
            "Fann does not hold, transfer or refund booking payments.",
            "Fann does not provide insurance, bonding or performance guarantees.",
            "Fann does not verify licences, permits or tax status.",
          ]}
        />
      </Section>

      <Section title="Protecting yourself on a booking">
        <p>
          Most problems are avoidable and almost all of them are about
          expectations rather than bad faith. What actually helps:
        </p>
        <Points
          items={[
            <>
              <strong className="text-ink">Keep the conversation on
              Fann.</strong> Messages stay on the platform and stay readable
              later, which matters when the disagreement is about what was
              agreed six weeks ago.
            </>,
            <>
              <strong className="text-ink">Write down the boring
              details.</strong> Start time, running time, who brings sound,
              access to the venue, what happens if the date moves.
            </>,
            <>
              <strong className="text-ink">Read the terms on the
              profile.</strong> Deposit and cancellation policy are shown on
              every profile without a subscription, because you need them
              before you commit.
            </>,
            <>
              <strong className="text-ink">Be wary of pressure to move
              off-platform</strong> before you have agreed anything, and of
              anyone asking for an unusually large payment up front.
            </>,
          ]}
        />
      </Section>

      <Section title="Reporting a problem">
        <p>
          If a profile looks fraudulent, someone behaves badly in messages, or
          a booking goes wrong in a way Fann should know about, report it
          through the{" "}
          <Link href="/help" className="font-semibold text-clay-deep underline">
            help and contact form
          </Link>
          . Include the profile link and anything specific — dates, what was
          agreed, what happened.
        </p>
        <p>
          Reports are read by a person. Depending on what is found, an account
          can be suspended or banned outright, which removes it from the
          directory. There is no automated moderation on Fann and no
          per-profile report button; the form is the route, and it works
          whether or not you have an account.
        </p>
      </Section>

      <Section title="Your data">
        <p>
          What Fann collects and how long it is kept is set out in the{" "}
          <Link href="/privacy" className="font-semibold text-clay-deep underline">
            privacy policy
          </Link>
          . Identity documents, where an artist has provided them, are held
          under a retention schedule and are never served publicly or shown on
          a profile. The{" "}
          <Link href="/terms" className="font-semibold text-clay-deep underline">
            terms of service
          </Link>{" "}
          cover the rest of the relationship, including the minimum age of 18.
        </p>
      </Section>

      <CallToAction
        heading="Still have a question?"
        body="If something here does not answer what you need to know before booking, ask. The reply comes from a person."
        href="/help"
        label="Contact Fann"
      />
    </MarketingPage>
  );
}
