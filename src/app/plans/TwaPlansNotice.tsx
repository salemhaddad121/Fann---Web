import Link from "next/link";
import { FannLockup } from "@/components/brand/FannMark";

/**
 * What /plans shows inside the Play app.
 *
 * ⚠️ Read F0.2 before editing a word of this. Google has historically
 * prohibited not only in-app purchase but linking out to external payment,
 * and in stricter readings even referring to it. The Epic ruling loosened
 * that in the US; the position for a Lebanese merchant is unverified.
 *
 * So this states that the subscription is managed elsewhere and stops.
 * There is deliberately **no price, no URL, no "visit our website", and no
 * button** — Netflix ran exactly this screen for years. Adding any of them
 * is cheap to do and expensive to be wrong about.
 *
 * Everything reachable from here is free either way: browsing the directory
 * needs no account at all, and artists are never charged.
 */
export function TwaPlansNotice() {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-hairline bg-surface/85 px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center">
          <Link href="/">
            <FannLockup size={22} textClassName="text-base" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 py-14 text-center">
        <i className="ti ti-user-check text-3xl text-faint" aria-hidden />
        <h1 className="mt-3 font-display text-[22px] font-bold text-ink">
          Subscriptions are managed outside the app
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your Fann plan is not managed here. If your account already has an
          active subscription, everything it unlocks works normally in the app
          — signing in is all that is needed.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Artists are free to list and are never charged.
        </p>

        <div className="mt-8 rounded-[14px] border border-hairline bg-surface p-5 text-left">
          <p className="text-sm font-semibold text-ink">You can still do all of this</p>
          <ul className="mt-2.5 flex flex-col gap-2 text-[13px] leading-relaxed text-muted">
            <li className="flex gap-2.5">
              <i className="ti ti-point-filled mt-[3px] shrink-0 text-sm text-clay" aria-hidden />
              <span>Browse every artist on Fann, with no account.</span>
            </li>
            <li className="flex gap-2.5">
              <i className="ti ti-point-filled mt-[3px] shrink-0 text-sm text-clay" aria-hidden />
              <span>See portfolios, availability and booking terms in full.</span>
            </li>
            <li className="flex gap-2.5">
              <i className="ti ti-point-filled mt-[3px] shrink-0 text-sm text-clay" aria-hidden />
              <span>Create an artist profile and get booked.</span>
            </li>
          </ul>
        </div>

        <Link
          href="/search"
          className="mt-8 inline-block rounded-[10px] bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          Browse artists
        </Link>
      </main>
    </div>
  );
}
