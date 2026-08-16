import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, Section, CallToAction } from "@/components/marketing/MarketingPage";

export const metadata: Metadata = {
  // Absolute, or the layout template makes this "About Fann — Fann". The
  // brand name is kept in the title rather than trimmed to "About" because
  // this page is part of ranking for "Fann" itself.
  title: { absolute: "About Fann" },
  description:
    "Fann is a Lebanese marketplace connecting artists — DJs, bands, photographers, MCs and more — with the businesses booking them. No booking commissions.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: "About Fann",
    description:
      "A Lebanese marketplace connecting artists with the businesses booking them. No booking commissions.",
  },
};

export default function AboutPage() {
  return (
    <MarketingPage
      title="About Fann"
      lead="Fann is a Lebanese marketplace that connects performing artists with the people booking them for events. Fann is the Arabic word for art."
    >
      <Section title="Why it exists">
        <p>
          Booking a performer in Lebanon runs on personal networks. You ask a
          friend, who asks a cousin, who has a number for a DJ who was good at
          a wedding two years ago. It works, and it is also the reason the same
          twenty acts get booked repeatedly while everyone else waits to be
          discovered.
        </p>
        <p>
          The problem is symmetrical. Planners cannot see past the edge of
          their own network, and artists without one cannot get in front of
          anybody. Fann exists to put both sides in the same place: artists
          with a portfolio, a calendar and terms; planners who can search all
          of it at once.
        </p>
      </Section>

      <Section title="How Fann makes money">
        <p>
          Planners pay a subscription. Artists list for free, and Fann takes no
          commission on any booking — the fee you agree with a performer is the
          fee they receive, paid directly to them.
        </p>
        <p>
          This is deliberate. A percentage of every booking would give Fann a
          reason to insert itself into a relationship that works better
          without it, and would push both sides to agree the deal off-platform
          to avoid the cut.
        </p>
      </Section>

      <Section title="Lebanon only, businesses only">
        <p>
          Fann covers Lebanon and is not planning to be elsewhere. A
          marketplace is only as good as its depth in one place, and depth in
          Beirut is worth more than a thin presence across the region.
        </p>
        <p>
          It is also for businesses. Fann is built for venues, event planners,
          hotels, restaurants and companies booking performers — not for
          individuals arranging something at home. Anyone using it must be 18
          or over.
        </p>
      </Section>

      <Section title="Fann is small">
        <p>
          Small enough that a message about something broken, something
          missing, or something that would make the platform genuinely more
          useful gets read by the person who can act on it. If you are an
          artist wondering whether your category belongs here, or a venue with
          a booking pattern this does not fit,{" "}
          <Link href="/help" className="font-semibold text-clay-deep underline">
            get in touch
          </Link>
          .
        </p>
      </Section>

      <CallToAction
        heading="Have a look around"
        body="The directory is open. Browse artists across Lebanon without an account and see whether there is depth here worth using."
        href="/search"
        label="Browse artists"
      />
    </MarketingPage>
  );
}
