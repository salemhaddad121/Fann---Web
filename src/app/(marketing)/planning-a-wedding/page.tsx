import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, Section, Points, CallToAction } from "@/components/marketing/MarketingPage";

// One group's slugs, so the link lands on exactly these. A set spanning
// music and visual would narrow to music on the search page and quietly
// drop the photographers. See the weddings page.
const WEDDING_MUSIC = ["band-group", "dj", "singer-vocalist", "dabke-group", "oud-player"];

export const metadata: Metadata = {
  title: "Planning a wedding in Lebanon",
  description:
    "A practical timeline for booking wedding entertainment in Lebanon — when to book, what to ask, what to agree in writing, and how to avoid the usual problems.",
  alternates: { canonical: "/planning-a-wedding" },
  openGraph: {
    url: "/planning-a-wedding",
    title: "Planning a wedding in Lebanon",
    description:
      "When to book wedding entertainment in Lebanon, what to ask, and what to agree in writing.",
  },
};

export default function PlanningAWeddingPage() {
  return (
    <MarketingPage
      title="Planning a wedding in Lebanon"
      lead="This is about the entertainment specifically — the part that is booked earliest, costs more than people expect, and is remembered longest. If you are looking for who is available rather than how to go about it, the wedding directory is one click away."
    >
      <Section title="A rough timeline">
        <p>
          Dates matter more than budget for the first few months of planning.
          Summer Saturdays are the constraint, and the good performers commit
          to them a long way ahead.
        </p>
        <Points
          items={[
            <>
              <strong className="text-ink">9–12 months out.</strong> Venue and
              date. Nothing else can be booked properly until these are fixed.
            </>,
            <>
              <strong className="text-ink">8–10 months out.</strong>{" "}
              Photographer and videographer. These go first, and the good ones
              go earliest — often before the couple has thought about music.
            </>,
            <>
              <strong className="text-ink">6–9 months out.</strong> The band or
              DJ for the reception. If a specific act matters to you, this is
              the point at which wanting them is still realistic.
            </>,
            <>
              <strong className="text-ink">3–5 months out.</strong> The zaffe
              or dabke group, and an MC if the evening needs one.
            </>,
            <>
              <strong className="text-ink">1–2 months out.</strong> Confirm
              running order, timings and access with everyone you have booked.
              This is the step most often skipped, and the one that causes the
              most trouble on the day.
            </>,
          ]}
        />
        <p>
          Booking later than this is entirely possible. You are simply choosing
          from a smaller pool, which is a real cost even when it does not look
          like one.
        </p>
      </Section>

      <Section title="Questions worth asking before you commit">
        <Points
          items={[
            "How long do you actually play, and how many breaks?",
            "Do you bring your own sound and lighting, or is that on the venue?",
            "How much space and power do you need, and when do you need access?",
            "Who exactly is performing? For a band, is it the same line-up as in the video?",
            "What happens if we move the date — and what happens if you cannot make it?",
            "Is the price inclusive of travel, and of setup time?",
          ]}
        />
        <p>
          The last two are the ones people skip and later wish they had not.
        </p>
      </Section>

      <Section title="Where the budget actually goes">
        <p>
          Entertainment is usually the third-largest line after venue and
          catering, and it is the one with the widest range. A DJ and a
          ten-piece band with a brass section are both &ldquo;the music&rdquo;
          and are not remotely the same expense.
        </p>
        <p>
          Prices on Fann are shown as a starting rate on every profile, and
          visible without an account, so you can shape the budget before you
          talk to anyone. Deposit and cancellation terms are shown too — read
          them before you decide, not after.
        </p>
      </Section>

      <Section title="Put it in writing, on the platform">
        <p>
          Almost every dispute is about scope rather than quality: how many
          hours, who brought the PA, whether travel was included. Keep the
          conversation in Fann messages so the arrangement is still readable
          months later, and confirm the boring details explicitly rather than
          assuming they are understood.
        </p>
        <p>
          Worth knowing: Fann is not a party to the agreement and does not
          handle the payment. You contract with the performer directly. The{" "}
          <Link
            href="/trust-and-safety"
            className="font-semibold text-clay-deep underline"
          >
            trust &amp; safety page
          </Link>{" "}
          sets out exactly where that line sits.
        </p>
      </Section>

      <Section title="One thing people wish they had done">
        <p>
          Book someone for the quiet part of the evening. Almost all the
          attention goes to the entrance and the dancing, and the hour of
          arrivals and dinner in between is left to a playlist. An oud player,
          a pianist or a solo singer covering that stretch changes the feel of
          the whole evening for a fraction of what the headline act costs.
        </p>
      </Section>

      <CallToAction
        heading="See who is free on your date"
        body="Browse bands, DJs, dabke groups and singers across Lebanon and check availability. The full wedding directory — photographers, videographers and MCs included — is on the weddings page."
        href={`/search?categories=${encodeURIComponent(WEDDING_MUSIC.join(","))}`}
        label="Browse wedding music"
      />
    </MarketingPage>
  );
}
