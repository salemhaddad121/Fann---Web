import type { Metadata } from "next";
import { MarketingPage, Section, Points, CallToAction } from "@/components/marketing/MarketingPage";
import { ArtistShowcase } from "@/components/marketing/ArtistShowcase";

// Grouped to match the search page's one-group-at-a-time filter, so every
// link lands on exactly the categories it names. See the weddings page.
const MUSIC = ["dj", "band-group", "singer-vocalist", "jazz-musician", "pianist", "oud-player"];
const PRODUCTION = ["sound-lighting", "led-screen-av-setup"];

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Live entertainment for venues in Lebanon",
  description:
    "Bars, restaurants, hotels and rooftops booking resident DJs, live bands and musicians in Lebanon. Browse profiles, check availability and book directly.",
  alternates: { canonical: "/venues" },
  openGraph: {
    url: "/venues",
    title: "Live entertainment for venues in Lebanon",
    description:
      "Resident DJs, live bands and musicians for bars, restaurants, hotels and rooftops across Lebanon.",
  },
};

export default function VenuesPage() {
  return (
    <MarketingPage
      width="wide"
      title="Live entertainment for venues"
      lead="Bars, restaurants, hotels and rooftops have a booking problem nobody else has: it repeats every week. Fann is a directory of performers you can go back to, rather than a contact list that ages out every time someone stops replying."
    >
      <Section title="The problem is filling next Friday, and the one after">
        <p>
          A wedding is booked once. A venue is booked fifty times a year, and
          the roster it runs on is usually a handful of numbers in a phone
          belonging to whoever books the music. When that person leaves, or the
          regular act stops answering, the whole thing has to be rebuilt from
          scratch.
        </p>
        <p>
          The value of a directory here is depth rather than novelty. Being
          able to find three more musicians who play the same thing as the one
          who cancelled is worth more than discovering someone new.
        </p>
      </Section>

      <ArtistShowcase
        heading="DJs, bands and musicians"
        categories={MUSIC}
        emptyBlurb="No musicians have listed yet — the roster is still filling out."
      />

      <ArtistShowcase
        heading="Sound and lighting"
        categories={PRODUCTION}
        emptyBlurb="No technical crews have listed yet — the roster is still filling out."
      />

      <Section title="What venues tend to book">
        <Points
          items={[
            <>
              <strong className="text-ink">Resident and rotating DJs</strong>,
              which is the bulk of weekend booking for most bars.
            </>,
            <>
              <strong className="text-ink">Live bands</strong> for a specific
              night, where the draw is the act rather than the venue.
            </>,
            <>
              <strong className="text-ink">Solo musicians</strong> — a pianist,
              a jazz player, an oud player — for dinner service, where the job
              is atmosphere rather than attention.
            </>,
            <>
              <strong className="text-ink">Sound and lighting</strong> for
              venues without a permanent setup, or for one-off nights that
              outgrow the house system.
            </>,
          ]}
        />
      </Section>

      <Section title="Repeat bookings and standing arrangements">
        <p>
          Fann handles a booking as a single event with a date, which suits a
          one-off well and a weekly residency less well. For a standing
          arrangement, the practical approach today is to agree the terms with
          the performer directly and use Fann to find them, keep the
          conversation in one place, and cover the weeks the regular cannot
          make.
        </p>
        <p>
          If recurring bookings would genuinely change how you use this,{" "}
          <a href="/help" className="font-semibold text-clay-deep underline">
            say so
          </a>
          . Fann is small enough that what venues actually need still shapes
          what gets built.
        </p>
      </Section>

      <Section title="What Fann charges">
        <p>
          No commission on bookings, and nothing taken from the performer. A
          venue books on the same planner subscription as anyone else, which
          unlocks contact details and messaging across the whole directory
          rather than per booking.
        </p>
      </Section>

      <CallToAction
        heading="Build a roster you can go back to"
        body="Browse DJs, bands and musicians across Lebanon, filter by city, and save the ones worth calling again."
        href={`/search?categories=${encodeURIComponent(MUSIC.join(","))}`}
        label="Browse performers for venues"
      />
    </MarketingPage>
  );
}
