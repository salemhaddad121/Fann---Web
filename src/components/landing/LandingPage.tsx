"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories } from "@/lib/artists-api";
import { getEventTypes } from "@/lib/planners-api";
import { PageBackground } from "@/components/shell/PageBackground";
import { PublicHeader } from "@/components/search/PublicHeader";

// Copy comes from Salem's "Landing Page.docx". Note the deliberate cross-sell:
// the artist section lists the *event* types an artist could get booked for,
// and the planner section lists the *artist* categories they can hire —
// each audience is shown what they'd find on the other side.

function Pills({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5 mt-4">
      {items.map((label) => (
        <li
          key={label}
          className="font-display text-[13px] text-ink/80 bg-white/70 border border-hairline rounded-full px-3 py-1"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}

function JoinNow({ role }: { role: "artist" | "planner" }) {
  return (
    <Link
      href={`/auth/register?role=${role}`}
      className="inline-flex items-center gap-1.5 mt-5 bg-indigo text-white text-sm font-semibold px-5 py-2.5 rounded-[10px]"
    >
      JOIN NOW <i className="ti ti-arrow-right text-base" />
    </Link>
  );
}

function NoFees({ freeToUse = false }: { freeToUse?: boolean }) {
  return (
    <p className="mt-3 text-[13px] font-semibold text-success flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="flex items-center gap-1">
        <i className="ti ti-circle-check text-sm" /> No booking commissions
      </span>
      <span className="flex items-center gap-1">
        <i className="ti ti-circle-check text-sm" /> No hidden fees
      </span>
      {freeToUse && (
        <span className="flex items-center gap-1">
          <i className="ti ti-circle-check text-sm" /> Free to use
        </span>
      )}
    </p>
  );
}

export function LandingPage() {
  const [artistCategories, setArtistCategories] = useState<string[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  // Both endpoints are public, so the landing page can show real taxonomy
  // without a session. Non-critical — the sections read fine without them.
  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((groups) => {
        if (cancelled) return;
        const names = groups
          .flatMap((g) => g.categories.map((c) => c.name))
          .filter((n) => !n.toLowerCase().startsWith("other"));
        setArtistCategories(names);
      })
      .catch(() => {});
    getEventTypes()
      .then((types) => {
        if (!cancelled) setEventTypes(types);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      <PageBackground role="artist" />
      <div className="relative z-10">
        <PublicHeader />

        <main className="px-5 pb-16 max-w-5xl mx-auto">
          {/* Banner */}
          <section className="pt-10 pb-12 lg:pt-16 lg:pb-16 max-w-3xl">
            <h1 className="font-display text-[30px] leading-[1.15] lg:text-[44px] font-bold text-ink">
              Book Lebanon&apos;s live talent.
            </h1>
            <p className="mt-4 text-[15px] lg:text-base text-ink/80 leading-relaxed">
              Fann connects event planners &amp; talented artists across Lebanon — DJs,
              photographers, bands, MCs, and more — all in one place. Browse verified profiles,
              compare portfolios and availability, and book the right performer for your event
              with confidence.
            </p>
            <NoFees />
            <p className="mt-4 text-sm text-muted leading-relaxed">
              Whether you&apos;re planning a wedding, a corporate event, or looking for a
              performance at your venue, Fann makes it easy to find, message, and hire local
              artists without the back-and-forth.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              <Link
                href="/auth/register"
                className="bg-indigo text-white text-sm font-semibold px-5 py-2.5 rounded-[10px]"
              >
                Get started
              </Link>
              <Link
                href="/auth/login"
                className="bg-white text-ink text-sm font-semibold px-5 py-2.5 rounded-[10px] border border-hairline"
              >
                Log in
              </Link>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            {/* For Artists */}
            <section className="bg-white/85 border border-hairline rounded-[18px] p-6 lg:p-7">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo">
                For Artists
              </span>
              <h2 className="font-display text-[22px] lg:text-[26px] font-bold text-ink mt-1.5">
                A home online for your talent.
              </h2>
              <p className="mt-3 text-sm text-ink/80 leading-relaxed">
                Fann gives you a home online to showcase your talent and get booked. Create a
                profile with your portfolio, set your availability, and let event planners across
                Lebanon find and book you directly.
              </p>
              <p className="mt-3 text-sm text-ink/80 leading-relaxed">
                Fann puts your work in front of the people who need it, when they need it.
              </p>
              <NoFees freeToUse />
              <p className="mt-5 text-xs font-semibold text-faint uppercase tracking-wide">
                Get booked for
              </p>
              <Pills items={eventTypes} />
              <JoinNow role="artist" />
            </section>

            {/* For Planners (Bookers) */}
            <section className="bg-white/85 border border-hairline rounded-[18px] p-6 lg:p-7">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-sky">
                For Bookers
              </span>
              <h2 className="font-display text-[22px] lg:text-[26px] font-bold text-ink mt-1.5">
                Beyond your own network.
              </h2>
              <p className="mt-3 text-sm text-ink/80 leading-relaxed">
                Fann takes you out of your immediate network of talent and provides you with a
                vast directory of performing artists and event services.
              </p>
              <p className="mt-3 text-sm text-ink/80 leading-relaxed">
                Search verified artists — DJs, photographers, bands, MCs, and much more — compare
                portfolios and availability, and book with confidence, all in one place. From
                weddings to corporate events.
              </p>
              <p className="mt-3 text-sm text-ink/80 leading-relaxed">
                Find the right performer without endless phone calls, referrals, and endless
                searching on Instagram.
              </p>
              <p className="mt-5 text-xs font-semibold text-faint uppercase tracking-wide">
                Hire from
              </p>
              <Pills items={artistCategories} />
              <JoinNow role="planner" />
            </section>
          </div>
        </main>

        <footer className="border-t border-hairline bg-white/85 px-5 py-6">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <span className="font-display text-base font-bold text-ink">
              fan<span className="text-indigo">n</span>
            </span>
            <span className="text-xs text-faint">
              Connecting artists and event bookers across Lebanon.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
