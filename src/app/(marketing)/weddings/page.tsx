import type { Metadata } from "next";
import { MarketingPage, Section, Points, CallToAction } from "@/components/marketing/MarketingPage";
import { ArtistShowcase } from "@/components/marketing/ArtistShowcase";

/*
 * Category sets are grouped to match the search page's filter model.
 *
 * /search holds one main category group at a time, so a link mixing music
 * and visual slugs resolves to whichever group comes first and silently
 * drops the rest — the visitor would land on bands after clicking a link
 * that promised photographers too. Keeping each set inside one group means
 * every link delivers exactly what it offered.
 */
const MUSIC = ["band-group", "dj", "singer-vocalist", "dabke-group", "oud-player"];
const VISUAL = ["photographer", "videographer"];
const HOSTS = ["mc-host"];

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Wedding entertainment in Lebanon",
  description:
    "Find and book wedding bands, DJs, dabke groups, photographers and MCs across Lebanon. Compare portfolios and availability, and book directly — no booking commissions.",
  alternates: { canonical: "/weddings" },
  openGraph: {
    url: "/weddings",
    title: "Wedding entertainment in Lebanon",
    description:
      "Wedding bands, DJs, dabke groups, photographers and MCs across Lebanon — compare and book directly.",
  },
};

export default function WeddingsPage() {
  return (
    <MarketingPage
      width="wide"
      title="Wedding entertainment in Lebanon"
      lead="Most Lebanese weddings are booked through someone who knows someone. That works right up until the band your cousin recommended is already taken on your date. Fann is the other option: a directory of working performers, with their portfolios and their availability, in one place."
    >
      <Section title="Start earlier than you think you need to">
        <p>
          Saturday evenings between June and September are the most contested
          slots in the country. The bands and DJs with a reputation are
          reserved a long way out, and the closer you get to the date, the more
          you are choosing from whoever happens to be free rather than whoever
          you actually wanted.
        </p>
        <p>
          Every profile on Fann carries the artist&apos;s own calendar, so you
          can see whether your date is already blocked before you spend an
          evening exchanging messages about it.
        </p>
      </Section>

      <ArtistShowcase
        heading="Bands, DJs and musicians"
        categories={MUSIC}
        emptyBlurb="No musicians have listed yet — the roster is still filling out."
      />

      <ArtistShowcase
        heading="Photographers and videographers"
        categories={VISUAL}
        emptyBlurb="No photographers have listed yet — the roster is still filling out."
      />

      <ArtistShowcase
        heading="MCs and hosts"
        categories={HOSTS}
        emptyBlurb="No MCs have listed yet — the roster is still filling out."
      />

      <Section title="What a Lebanese wedding usually needs">
        <p>
          The exact shape varies by family and by venue, but most bookings are
          some combination of these:
        </p>
        <Points
          items={[
            <>
              <strong className="text-ink">A zaffe or dabke group</strong> for
              the entrance. Short, loud, and the part everyone films.
            </>,
            <>
              <strong className="text-ink">A band or a DJ</strong> for the
              reception — or both, with the band playing a set and the DJ
              carrying the rest of the night.
            </>,
            <>
              <strong className="text-ink">A photographer and a
              videographer</strong>, usually booked as a pair and usually the
              first thing to go for popular dates.
            </>,
            <>
              <strong className="text-ink">An MC</strong> if the evening has a
              programme to hold together, particularly for larger guest lists.
            </>,
            <>
              <strong className="text-ink">An oud player or a singer</strong>{" "}
              for the quieter part of the evening, which is easy to forget
              about until the day itself.
            </>,
          ]}
        />
      </Section>

      <Section title="Agree the details in writing, not in a phone call">
        <p>
          The disputes that happen are almost never about the performance. They
          are about how many hours were included, who was providing the sound
          system, what time the performers could get into the venue, and what
          happens if the date moves.
        </p>
        <p>
          Messages on Fann stay on the platform, so the arrangement you agreed
          is still readable in a month. Booking terms — the deposit an artist
          asks for and their cancellation policy — are shown on every profile
          without a subscription, because those are the terms you need before
          you decide, not after.
        </p>
      </Section>

      <Section title="What Fann charges">
        <p>
          Nothing on the booking. Fann does not take a commission and does not
          sit between you and the artist for payment — you agree a fee with
          them and pay them directly. Planners pay a subscription to unlock
          contact details and message artists; artists list for free.
        </p>
      </Section>

      <CallToAction
        heading="See who is available"
        body="Start with the music — it is the booking with the least slack on a summer Saturday. Filter by city and check availability before you get in touch."
        href={`/search?categories=${encodeURIComponent(MUSIC.join(","))}`}
        label="Browse bands and DJs"
      />
    </MarketingPage>
  );
}
