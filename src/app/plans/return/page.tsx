"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getPayment } from "@/lib/subscriptions-api";
import { FannLockup } from "@/components/brand/FannMark";
import type { MyPayment } from "@/types/subscriptions";

/** How long to keep asking before telling them to get on with their day. */
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20; // ~1 minute

const SETTLED = ["confirmed", "rejected", "expired", "disputed"];

function ReturnContent() {
  const params = useSearchParams();
  const paymentId = params.get("payment");

  const [payment, setPayment] = useState<MyPayment | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const polls = useRef(0);

  useEffect(() => {
    if (!paymentId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const next = await getPayment(paymentId!);
        if (cancelled) return;
        setPayment(next);

        if (SETTLED.includes(next.status)) return;

        // The webhook may well arrive after the customer does — they are
        // racing a server-to-server call over a redirect. Giving up quietly
        // and telling them we'll email is far better than spinning forever
        // on a page that cannot know the answer.
        if (++polls.current >= MAX_POLLS) {
          setGaveUp(true);
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setError("Couldn't check that payment.");
      }
    }

    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [paymentId]);

  if (!paymentId) {
    return <Body title="Nothing to show">That link is missing a payment reference.</Body>;
  }

  if (error) return <Body title="Something went wrong">{error}</Body>;

  if (payment?.status === "confirmed") {
    return (
      <Body title="Payment confirmed">
        Your {payment.plan_code} plan is active. Everything is unlocked.
        <Cta href="/search">Find artists</Cta>
      </Body>
    );
  }

  if (payment?.status === "rejected" || payment?.status === "disputed") {
    return (
      <Body title="That payment didn't go through">
        {payment.rejection_reason ??
          "Nothing has been charged to your plan. If money did leave your account, contact us and we'll sort it out."}
        <Cta href="/help">Contact support</Cta>
      </Body>
    );
  }

  if (payment?.status === "expired") {
    return (
      <Body title="That payment expired">
        The checkout session timed out before it completed. You can start again.
        <Cta href="/plans">Back to plans</Cta>
      </Body>
    );
  }

  if (gaveUp) {
    return (
      <Body title="Still waiting on confirmation">
        Your payment hasn&apos;t been confirmed yet. This is normal — it can take a
        few minutes. We&apos;ll email you the moment it clears, and your plan will
        appear on your dashboard.
        <Cta href="/dashboard">Back to dashboard</Cta>
      </Body>
    );
  }

  return <Body title="Checking your payment…">This usually takes a few seconds.</Body>;
}

function Body({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

function Cta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <Link
        href={href}
        className="inline-block rounded-[10px] bg-clay-deep px-5 py-2.5 text-sm font-semibold text-white"
      >
        {children}
      </Link>
    </div>
  );
}

/**
 * Where a hosted checkout sends the buyer back to.
 *
 * Polls rather than trusting the redirect, because the redirect proves only
 * that the customer's browser came back — not that the provider has told us
 * anything. The webhook is the authority, and it may arrive before, during
 * or after this page loads.
 */
export default function PaymentReturnPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-hairline bg-surface/85 px-5 py-4">
        <div className="mx-auto max-w-5xl">
          <Link href="/">
            <FannLockup size={22} textClassName="text-base" />
          </Link>
        </div>
      </header>
      {/* useSearchParams needs a Suspense boundary in the app router. */}
      <Suspense fallback={<Body title="Checking your payment…">One moment.</Body>}>
        <ReturnContent />
      </Suspense>
    </div>
  );
}
