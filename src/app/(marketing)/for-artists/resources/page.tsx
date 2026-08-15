import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage, Section, Points, CallToAction } from "@/components/marketing/MarketingPage";

export const metadata: Metadata = {
  title: "Artist resources",
  description:
    "Everything an artist needs to get started on Fann: how listing works, what it costs, how messaging and bookings run, and where to get help.",
  alternates: { canonical: "/for-artists/resources" },
  openGraph: {
    url: "/for-artists/resources",
    title: "Artist resources",
    description: "How listing on Fann works, what it costs, and where to get help.",
  },
};

function Guide({
  href,
  title,
  blurb,
}: {
  href: string;
  title: string;
  blurb: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-[14px] border border-hairline bg-surface/85 p-5 transition-colors hover:border-clay"
    >
      <span className="flex items-center gap-1.5 font-display text-[17px] font-bold text-ink">
        {title} <i className="ti ti-arrow-right text-base text-clay" aria-hidden />
      </span>
      <span className="mt-1.5 block text-[13px] leading-relaxed text-muted">{blurb}</span>
    </Link>
  );
}

export default function ArtistResourcesPage() {
  return (
    <MarketingPage
      title="Artist resources"
      lead="Listing on Fann is free and there is no commission on anything you get booked for. This is the short version of how it all works, and where to read more."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Guide
          href="/for-artists/getting-booked"
          title="Getting booked"
          blurb="What a strong profile looks like, why the calendar matters more than you would think, and how to answer an enquiry so it converts."
        />
        <Guide
          href="/for-artists/pricing-your-work"
          title="Pricing your work"
          blurb="What to account for beyond stage time, how deposits and cancellation terms work, and how your rate is shown to planners."
        />
        <Guide
          href="/how-it-works"
          title="How Fann works"
          blurb="The whole flow for both sides of the marketplace, from listing through to a confirmed booking."
        />
        <Guide
          href="/trust-and-safety"
          title="Trust & safety"
          blurb="How profiles are reviewed, what the verified badge means, and what Fann is and is not responsible for."
        />
      </div>

      <Section title="The basics">
        <Points
          items={[
            <>
              <strong className="text-ink">Listing is free.</strong> No fee to
              join, no fee to stay listed, and no commission on bookings.
            </>,
            <>
              <strong className="text-ink">Your profile is reviewed
              first.</strong> A person checks it before it appears in the
              directory, so there is a short wait after you finish it.
            </>,
            <>
              <strong className="text-ink">Planners contact you.</strong>{" "}
              Subscribed planners can message you directly. You can start a
              conversation with a planner too, but they have to accept the
              request before it becomes a thread.
            </>,
            <>
              <strong className="text-ink">You get paid directly.</strong> Fann
              never holds the money. You agree a fee and the planner pays you.
            </>,
            <>
              <strong className="text-ink">Your name is masked to
              non-subscribers.</strong> Everyone can see your work, your city,
              your terms and your availability; your full name and contact
              details are only shown to planners who have subscribed.
            </>,
          ]}
        />
      </Section>

      <Section title="What you need before you sign up">
        <p>
          Nothing formal, but the profile goes much faster if you have these to
          hand: photos and video of yourself performing, the categories you
          work in, your city, the languages you work in, a starting rate, and
          your deposit and cancellation terms.
        </p>
      </Section>

      <Section title="Getting help">
        <p>
          If something is broken, unclear, or your category does not seem to
          exist,{" "}
          <Link href="/help" className="font-semibold text-clay-deep underline">
            contact Fann
          </Link>
          . Fann is small, and messages about what artists actually need still
          change what gets built.
        </p>
      </Section>

      <CallToAction
        heading="Ready to list?"
        body="Creating an artist profile is free and takes about ten minutes if you have your photos ready."
        href="/auth/register?role=artist"
        label="Join as an artist"
      />
    </MarketingPage>
  );
}
