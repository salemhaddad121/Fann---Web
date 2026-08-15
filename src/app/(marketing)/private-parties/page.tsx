import type { Metadata } from "next";
import { MarketingPage, Section, Points, CallToAction } from "@/components/marketing/MarketingPage";
import { ArtistShowcase } from "@/components/marketing/ArtistShowcase";

// Grouped to match the search page's one-group-at-a-time filter, so every
// link lands on exactly the categories it names. See the weddings page.
const MUSIC = ["dj", "band-group", "singer-vocalist"];
const PERFORMERS = ["magician", "belly-dancer", "caricaturist", "dancer-dance-group"];
const VISUAL = ["photo-booth", "360-video-booth", "photographer"];

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Private party entertainment in Lebanon",
  description:
    "Book DJs, bands, magicians, dancers, photo booths and children's entertainers for private parties in Lebanon. Browse profiles and book directly.",
  alternates: { canonical: "/private-parties" },
  openGraph: {
    url: "/private-parties",
    title: "Private party entertainment in Lebanon",
    description:
      "DJs, bands, magicians, dancers and photo booths for private parties across Lebanon.",
  },
};

export default function PrivatePartiesPage() {
  return (
    <MarketingPage
      width="wide"
      title="Private party entertainment in Lebanon"
      lead="Birthdays, engagements, anniversaries and house parties. Smaller than a wedding, booked much later, and usually organised by someone doing it for the first time. Fann lets you see who is actually available before you start asking around."
    >
      <Section title="Match the act to the room, not to the occasion">
        <p>
          The most common mistake at a private party is booking something too
          big for the space. A full band in an apartment is louder than the
          conversation it was meant to accompany, and a rooftop with forty
          people does not need the setup a hall with three hundred does.
        </p>
        <p>
          A solo singer, a DJ, or an oud player will suit most rooms in Beirut
          better than a five-piece will. Profiles list what the performer
          actually brings, so the practical questions are answerable before
          you get to the fee.
        </p>
      </Section>

      <ArtistShowcase
        heading="DJs, bands and singers"
        categories={MUSIC}
        emptyBlurb="No musicians have listed yet — the roster is still filling out."
      />

      <ArtistShowcase
        heading="Magicians, dancers and entertainers"
        categories={PERFORMERS}
        emptyBlurb="No entertainers have listed yet — the roster is still filling out."
      />

      <ArtistShowcase
        heading="Photo booths and photographers"
        categories={VISUAL}
        emptyBlurb="No photo booths have listed yet — the roster is still filling out."
      />

      <Section title="Popular for smaller events">
        <Points
          items={[
            <>
              <strong className="text-ink">A DJ</strong> — the most flexible
              booking on this list, and the easiest to scale to the room.
            </>,
            <>
              <strong className="text-ink">A photo booth</strong>, which tends
              to do more for a party&apos;s atmosphere per lira than almost
              anything else.
            </>,
            <>
              <strong className="text-ink">A magician or a
              caricaturist</strong> for events where guests are seated and
              moving between tables.
            </>,
            <>
              <strong className="text-ink">Children&apos;s entertainers</strong>{" "}
              for family gatherings, where the entertainment problem is usually
              the under-tens rather than the adults.
            </>,
            <>
              <strong className="text-ink">A belly dancer or a dance
              group</strong> for a set piece — short, planned, and worth
              agreeing the timing of in advance.
            </>,
          ]}
        />
      </Section>

      <Section title="Sort out the practical things early">
        <p>
          Ask about the three things that cause trouble on the night: how long
          the performance actually runs, whether they bring their own sound,
          and how much space and power they need. None of these are difficult
          questions, and all of them are much easier to answer a week ahead
          than an hour before guests arrive.
        </p>
        <p>
          Deposit and cancellation terms are shown on every profile without a
          subscription. For a private party those matter more than usual, since
          these are the events most likely to move.
        </p>
      </Section>

      <CallToAction
        heading="See who is available"
        body="A DJ is the most flexible booking for a smaller room and the easiest place to start. Check your date before you get in touch."
        href={`/search?categories=${encodeURIComponent(MUSIC.join(","))}`}
        label="Browse DJs and bands"
      />
    </MarketingPage>
  );
}
