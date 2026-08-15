import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, Section, Points, CallToAction } from "@/components/marketing/MarketingPage";
import { AudienceToggle } from "./AudienceToggle";

export const metadata: Metadata = {
  title: "How Fann works",
  description:
    "How booking works on Fann for event planners, and how listing works for artists. Artists are free, planners subscribe, and Fann takes no commission on bookings.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    url: "/how-it-works",
    title: "How Fann works",
    description:
      "Booking for planners, listing for artists. Artists are free and Fann takes no commission.",
  },
};

function PlannerPanel() {
  return (
    <>
      <Section title="1. Browse without an account">
        <p>
          The directory is open. You can search every active artist, filter by
          category, city and price, and open full profiles — portfolio,
          location, languages, booking terms and availability — without
          signing up for anything.
        </p>
        <p>
          Two things are held back until you subscribe: the artist&apos;s full
          name and their contact details. Everything you need to decide whether
          someone is worth contacting is visible before you pay.
        </p>
      </Section>

      <Section title="2. Subscribe when you want to reach someone">
        <p>
          A planner subscription unlocks names, contact details and direct
          messaging across the whole directory — it is not per booking or per
          artist. Day, month and year options are on the{" "}
          <Link href="/plans" className="font-semibold text-clay-deep underline">
            plans page
          </Link>
          .
        </p>
      </Section>

      <Section title="3. Message, agree, book">
        <p>
          Message the artist on Fann, agree the date, the fee and the details,
          and send a booking request for the date. The artist confirms or
          declines it, and the confirmed date shows on their calendar so nobody
          double-books it.
        </p>
        <p>
          You pay the artist directly. Fann takes no commission and does not
          handle the money, so the fee you agree is the fee they receive.
        </p>
      </Section>

      <Section title="What it costs">
        <Points
          items={[
            "Browsing and full profiles: free, no account.",
            "Contact details and messaging: planner subscription.",
            "Commission on bookings: none.",
          ]}
        />
      </Section>
    </>
  );
}

function ArtistPanel() {
  return (
    <>
      <Section title="1. Create your profile">
        <p>
          Listing on Fann is free, and stays free — there is no commission on
          anything you get booked for. Sign up, choose the categories you
          actually work in, and fill in your bio, city, languages and price.
        </p>
        <p>
          Your profile is reviewed by a person before it appears in the
          directory. That usually means a short wait after you finish it,
          rather than being live the moment you press save.
        </p>
      </Section>

      <Section title="2. Upload work worth judging you on">
        <p>
          The portfolio is the part that decides whether you get contacted.
          Photos and video of you actually performing do more than a written
          description of what you do — a planner comparing five profiles will
          spend most of that time looking rather than reading.
        </p>
        <p>
          There is more on this in{" "}
          <Link
            href="/for-artists/getting-booked"
            className="font-semibold text-clay-deep underline"
          >
            getting booked
          </Link>
          .
        </p>
      </Section>

      <Section title="3. Keep your calendar honest">
        <p>
          Block the dates you are not available. It is the single cheapest
          thing you can do to get booked more: planners filter on availability,
          and a calendar that is never updated eventually costs you the
          enquiries you would have wanted.
        </p>
      </Section>

      <Section title="4. Respond, confirm, get paid">
        <p>
          Subscribed planners can message you directly. You can also start a
          conversation with a planner, though they have to accept the request
          before you can carry on — this keeps the buyer side from being
          flooded.
        </p>
        <p>
          When you agree a booking, the planner sends a request for the date
          and you confirm it. Payment is arranged directly between you; Fann
          is not involved and takes nothing.
        </p>
      </Section>
    </>
  );
}

export default function HowItWorksPage() {
  return (
    <MarketingPage
      title="How Fann works"
      lead="Two sides, one directory. Artists list for free and Fann takes no commission on any booking; planners subscribe to get in touch. Pick the side you are on."
    >
      <AudienceToggle plannerPanel={<PlannerPanel />} artistPanel={<ArtistPanel />} />

      <CallToAction
        heading="Start by looking"
        body="Whichever side you are on, the directory is the fastest way to judge whether Fann is worth your time. No account needed."
        href="/search"
        label="Browse artists"
      />
    </MarketingPage>
  );
}
