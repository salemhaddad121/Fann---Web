import type { Metadata } from "next";
import Link from "next/link";
import { FannLockup } from "@/components/brand/FannMark";

/**
 * Shown when a navigation fails with no network.
 *
 * The service worker caches this at install and serves it in place of the
 * browser's own error page. That matters for the Play submission: a TWA
 * that drops the user onto Chrome's offline dinosaur reads as a broken
 * app rather than an offline one, and it fails Play's quality criteria.
 *
 * Deliberately plain. It cannot fetch anything, so it does not try —
 * no session, no data, no retry logic beyond reloading the page.
 */
export const metadata: Metadata = {
  title: "You're offline",
  // Nothing here should ever be indexed; it is a fallback shell, not a page.
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <FannLockup size={26} textClassName="text-lg" />

      <i className="ti ti-wifi-off mt-8 text-3xl text-faint" aria-hidden />
      <h1 className="mt-3 font-display text-[22px] font-bold text-ink">You&apos;re offline</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Fann needs a connection to load artists and messages. Check your
        network and try again — anything you had already opened may still work.
      </p>

      <Link
        href="/"
        className="mt-6 rounded-[10px] bg-ink px-5 py-3 text-sm font-semibold text-white"
      >
        Try again
      </Link>
    </main>
  );
}
