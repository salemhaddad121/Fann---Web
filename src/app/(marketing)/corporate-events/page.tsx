import type { Metadata } from "next";
import { MarketingPage, Section, Points, CallToAction } from "@/components/marketing/MarketingPage";
import { ArtistShowcase } from "@/components/marketing/ArtistShowcase";

// Grouped to match the search page's one-group-at-a-time filter, so every
// link lands on exactly the categories it names. See the weddings page.
const HOSTS = ["mc-host", "stand-up-comedian"];
const MUSIC = ["dj", "jazz-musician", "pianist"];
const PRODUCTION = ["sound-lighting", "led-screen-av-setup", "stage-decoration"];
const VISUAL = ["photographer", "videographer"];

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Corporate event entertainment in Lebanon",
  description:
    "Book MCs, DJs, AV and sound crews, photographers and musicians for corporate events in Lebanon. Compare portfolios, check availability and book directly.",
  alternates: { canonical: "/corporate-events" },
  openGraph: {
    url: "/corporate-events",
    title: "Corporate event entertainment in Lebanon",
    description:
      "MCs, DJs, AV crews, photographers and musicians for corporate events across Lebanon.",
  },
};

export default function CorporateEventsPage() {
  return (
    <MarketingPage
      width="wide"
      title="Corporate event entertainment in Lebanon"
      lead="Conferences, launches, staff parties and client evenings mostly fail on logistics rather than talent. Fann is a directory of performers and technical crews with their portfolios and availability visible, so the booking part stops being the unpredictable bit."
    >
      <Section title="Book the technical side as seriously as the talent">
        <p>
          The most common way a corporate evening goes wrong is sound. A hotel
          ballroom, a rooftop and a converted warehouse are three completely
          different acoustic problems, and a performer arriving to discover
          the room has no usable PA is a problem discovered far too late.
        </p>
        <p>
          Sound and lighting, LED and AV setup, and stage decoration are listed
          on Fann as their own categories, so they can be booked deliberately
          rather than assumed to be somebody else&apos;s job.
        </p>
      </Section>

      <ArtistShowcase
        heading="MCs, hosts and comedians"
        categories={HOSTS}
        emptyBlurb="No MCs have listed yet — the roster is still filling out."
      />

      <ArtistShowcase
        heading="DJs and musicians"
        categories={MUSIC}
        emptyBlurb="No musicians have listed yet — the roster is still filling out."
      />

      <ArtistShowcase
        heading="Sound, lighting and AV"
        categories={PRODUCTION}
        emptyBlurb="No technical crews have listed yet — the roster is still filling out."
      />

      <ArtistShowcase
        heading="Photographers and videographers"
        categories={VISUAL}
        emptyBlurb="No photographers have listed yet — the roster is still filling out."
      />

      <Section title="What corporate bookers usually need">
        <Points
          items={[
            <>
              <strong className="text-ink">An MC or host</strong> — the single
              highest-leverage booking for anything with an agenda. A good one
              keeps a programme on time without it feeling policed.
            </>,
            <>
              <strong className="text-ink">Background musicians</strong> for
              arrivals and dinner, where a jazz trio or a pianist does more for
              a room than a playlist.
            </>,
            <>
              <strong className="text-ink">A DJ</strong> for the part of the
              evening after the speeches, when people either stay or go home.
            </>,
            <>
              <strong className="text-ink">A photographer or
              videographer</strong>, usually because marketing needs the
              footage more than the attendees need the memory.
            </>,
            <>
              <strong className="text-ink">Sound, lighting and AV</strong>,
              booked against the actual venue rather than a general idea of it.
            </>,
          ]}
        />
      </Section>

      <Section title="Paperwork, invoices and approvals">
        <p>
          Corporate bookings usually involve a finance department, and finance
          departments want an invoice from the person being paid. Fann does not
          process the payment or issue the invoice — you contract directly with
          the artist, which means the paperwork is between you and them.
        </p>
        <p>
          Worth knowing before you start: Fann is business-only and is not a
          party to the agreement you reach. It is where you find and talk to
          the performer, not the counterparty on the contract.
        </p>
      </Section>

      <Section title="What Fann charges">
        <p>
          No commission on bookings and no fee taken from the artist&apos;s
          side. A planner subscription unlocks contact details and messaging;
          the fee you agree with the performer is the fee they receive.
        </p>
      </Section>

      <CallToAction
        heading="See who is available"
        body="Start with the host — for anything with an agenda it is the booking that carries the evening. Check availability against your date before you get in touch."
        href={`/search?categories=${encodeURIComponent(HOSTS.join(","))}`}
        label="Browse MCs and hosts"
      />
    </MarketingPage>
  );
}
