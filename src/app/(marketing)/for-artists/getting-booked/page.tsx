import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, Section, Points, CallToAction } from "@/components/marketing/MarketingPage";

export const metadata: Metadata = {
  title: "Getting booked",
  description:
    "Practical advice for artists on Fann: what a strong profile looks like, why your calendar matters, how to answer an enquiry, and what planners are comparing.",
  alternates: { canonical: "/for-artists/getting-booked" },
  openGraph: {
    url: "/for-artists/getting-booked",
    title: "Getting booked",
    description:
      "What a strong profile looks like, why your calendar matters, and how to answer an enquiry.",
  },
};

export default function GettingBookedPage() {
  return (
    <MarketingPage
      title="Getting booked"
      lead="A planner comparing performers is usually looking at several profiles in one sitting and deciding, quite quickly, which two or three to contact. Almost everything below is about surviving that first pass."
    >
      <Section title="Your portfolio is doing nearly all the work">
        <p>
          Someone scanning the directory looks at pictures before they read
          anything. A profile with one blurry photo loses to a profile with
          five good ones almost regardless of who is the better performer,
          which is unfair and also completely predictable.
        </p>
        <Points
          items={[
            "Show yourself performing, in front of people, not posed against a wall.",
            "Include video if you have any. A short clip of a real set is worth more than a long showreel nobody finishes.",
            "Pick a lead image that reads at thumbnail size — that is the size it will first be seen at.",
            "Vary the settings. A planner is trying to imagine you at their event, and five photos of the same night make that harder.",
          ]}
        />
      </Section>

      <Section title="Write the bio for someone deciding, not for someone browsing">
        <p>
          The useful bio answers the questions a planner is actually holding:
          what do you play, how long have you been doing it, what size of event
          suits you, what do you bring with you, and what languages do you
          work in.
        </p>
        <p>
          Adjectives do not survive comparison — every profile claims to be
          professional and energetic. Specifics do. &ldquo;Five-piece, two
          45-minute sets, we bring our own PA for rooms up to 200&rdquo; tells
          a planner more than a paragraph of enthusiasm.
        </p>
      </Section>

      <Section title="Pick your categories honestly">
        <p>
          It is tempting to tick everything adjacent to what you do on the
          theory that it widens your reach. It mostly widens the number of
          enquiries you have to turn down, and turning down enquiries is how
          you end up further down the list of people worth contacting.
        </p>
        <p>
          Tick what you are genuinely good at. The directory is searched by
          category, and being the obvious answer in one is better than being a
          marginal answer in six.
        </p>
      </Section>

      <Section title="Keep the calendar current">
        <p>
          Planners filter by availability, and blocked dates remove you from
          those results. The failure mode is not being filtered out — it is
          being contacted about a date you cannot do, twice, after which that
          planner stops asking.
        </p>
        <p>
          Blocking dates takes seconds and is the highest-return habit on this
          page.
        </p>
      </Section>

      <Section title="Answer quickly, and answer the question">
        <p>
          Events get planned to a deadline. A reply the next day is often
          simply too late, because the planner has already had three answers
          and started a conversation with one of them.
        </p>
        <p>
          When you reply, confirm the date, confirm the fee for that specific
          event, and say what is included. The performer who removes the most
          uncertainty in the first reply usually gets the booking, even at a
          slightly higher price than someone vaguer.
        </p>
      </Section>

      <Section title="Set terms you are willing to hold">
        <p>
          Your deposit and cancellation policy show on your profile at every
          tier, including to people who have not subscribed. They are read as
          a signal of how you work, so make them terms you will actually apply
          — a policy you waive whenever asked is worse than a softer one you
          keep.
        </p>
        <p>
          There is more on the number itself in{" "}
          <Link
            href="/for-artists/pricing-your-work"
            className="font-semibold text-clay-deep underline"
          >
            pricing your work
          </Link>
          .
        </p>
      </Section>

      <CallToAction
        heading="See what you are being compared against"
        body="Open the directory and look at your own category the way a planner would. It is the fastest way to see what your profile is up against."
        href="/search"
        label="Browse the directory"
      />
    </MarketingPage>
  );
}
