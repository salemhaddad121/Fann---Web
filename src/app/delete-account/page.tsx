import type { Metadata } from "next";
import Link from "next/link";
import { FannLockup } from "@/components/brand/FannMark";
import { DeleteAccountRequestForm } from "./DeleteAccountRequestForm";

/**
 * Public account deletion route.
 *
 * ⚠️ Google Play requires a deletion request URL that is reachable on the
 * open web and usable **without signing in**, and a missing one is a common
 * rejection. Fann already had deletion — but only at /(app)/account, behind
 * auth, which does not satisfy it: someone locked out of their account is
 * precisely the person who needs this.
 *
 * Outside the (app) route group and outside (marketing) on purpose. It
 * takes no session, and it should stay reachable even if the rest of the
 * chrome changes — including from a store listing, where it is linked
 * directly and read by a reviewer.
 *
 * This page does not delete anything. It explains what deletion does and
 * files a support ticket, because a form a stranger can submit must not be
 * able to destroy an account on the strength of a typed address.
 */
export const metadata: Metadata = {
  title: "Delete your account",
  description:
    "How to delete your Fann account and what happens to your data, including how to request deletion if you cannot sign in.",
  alternates: { canonical: "/delete-account" },
  openGraph: {
    url: "/delete-account",
    title: "Delete your account",
    description: "How to delete your Fann account and what happens to your data.",
  },
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-hairline bg-surface/85 px-5 py-4">
        <div className="mx-auto max-w-2xl">
          <Link href="/">
            <FannLockup size={22} textClassName="text-base" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="font-display text-[28px] font-bold leading-[1.15] text-ink">
          Delete your account
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
          You can delete your Fann account at any time. This page explains what
          happens when you do, and how to ask us to do it if you cannot sign in.
        </p>

        <section className="mt-8">
          <h2 className="font-display text-[20px] font-bold text-ink">
            If you can sign in
          </h2>
          <div className="mt-3 flex flex-col gap-3 text-[14px] leading-relaxed text-muted">
            <p>
              Deleting it yourself is immediate and is the fastest route. Sign
              in, open{" "}
              <Link href="/account" className="font-semibold text-clay-deep underline">
                Account settings
              </Link>
              , and choose Delete account at the bottom of the page. You will be
              asked for your password to confirm.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-[20px] font-bold text-ink">
            What gets deleted
          </h2>
          <div className="mt-3 flex flex-col gap-3 text-[14px] leading-relaxed text-muted">
            <p>
              Your profile stops being visible immediately — it disappears from
              search and from anyone&apos;s saved list. Your account details,
              profile information, uploaded photos and video, and any identity
              documents you provided are removed.
            </p>
            <p>
              Two things are not removed, and it is fairer to say so than to
              imply otherwise. Messages you sent remain in the other
              person&apos;s conversation, because they are that person&apos;s
              record of an arrangement as much as yours. Records of completed
              bookings and payments are kept where we are required to keep
              them, and are no longer linked to a usable account.
            </p>
            <p>
              If you have upcoming confirmed bookings, tell the other side
              before you delete — they lose the ability to reach you through
              Fann the moment the account is gone.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-[20px] font-bold text-ink">
            If you cannot sign in
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Send a request below and we will handle it by hand. We reply to the
            address on the account to confirm the request really came from you
            before deleting anything — an account that could be deleted by
            anyone who knows the email address would not be safe.
          </p>
          <div className="mt-4">
            <DeleteAccountRequestForm />
          </div>
        </section>

        <p className="mt-10 text-xs text-faint">
          What we collect and how long it is kept is set out in the{" "}
          <Link href="/privacy" className="font-semibold text-clay-deep underline">
            privacy policy
          </Link>
          . For anything else, use the{" "}
          <Link href="/help" className="font-semibold text-clay-deep underline">
            help page
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
