"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import {
  createPaymentIntent,
  listPlans,
  reportTransfer,
} from "@/lib/subscriptions-api";
import { PlanCards } from "@/components/plans/PlanCards";
import { Banner } from "@/components/auth/Banner";
import { Button } from "@/components/auth/Button";
import { FannLockup } from "@/components/brand/FannMark";
import {
  TRANSFER_SERVICES,
  type PaymentIntent,
  type PlanCode,
  type SubscriptionPlan,
  type TransferService,
} from "@/types/subscriptions";

const SERVICE_LABELS: Record<TransferService, string> = {
  OMT: "OMT",
  Wish: "Whish Money",
  WesternUnion: "Western Union",
  other: "Other",
};

/**
 * Payment instructions.
 *
 * The account code is the loudest thing on this screen deliberately: it is
 * the only way an incoming transfer gets matched back to an account, and a
 * transfer that arrives without it has to be reconciled by hand.
 */
function TransferInstructions({ intent }: { intent: PaymentIntent }) {
  const [service, setService] = useState<TransferService>("OMT");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!reference.trim()) {
      setError("Enter the reference number from your transfer receipt.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await reportTransfer(intent.id, service, reference.trim());
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save those details.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface p-5">
        <h2 className="text-base font-bold text-ink">Thanks — we&apos;ll take it from here</h2>
        <p className="mt-2 text-sm text-muted">
          Your transfer details are with our team. Once the payment clears we&apos;ll
          confirm it and your plan will appear on your dashboard. You&apos;ll get a
          notification when that happens.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm font-semibold text-clay-deep underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <h2 className="text-base font-bold text-ink">Send your payment</h2>
      <p className="mt-1 text-sm text-muted">
        Transfer the amount below, then tell us the reference number so we can
        match it to your account.
      </p>

      <dl className="mt-4 space-y-2.5 border-y border-hairline py-3.5">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-faint">Amount</dt>
          <dd className="text-lg font-bold text-ink">
            ${intent.amount_usd} {intent.currency}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-faint">Plan</dt>
          <dd className="text-sm font-medium text-ink">
            {intent.plan_code}
            {intent.quantity > 1 && ` × ${intent.quantity}`}
          </dd>
        </div>
        {intent.account_code && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-sm text-faint">
              Your reference code
              <span className="block text-xs text-faint">Quote this on the transfer</span>
            </dt>
            <dd className="rounded-lg bg-ink px-3 py-1.5 font-mono text-sm font-bold tracking-wide text-white">
              {intent.account_code}
            </dd>
          </div>
        )}
      </dl>

      {error && <Banner kind="error">{error}</Banner>}

      <label className="mt-4 block text-sm font-medium text-ink">
        Which service did you use?
        <select
          value={service}
          onChange={(e) => setService(e.target.value as TransferService)}
          className="mt-1.5 w-full rounded-[10px] border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-clay"
        >
          {TRANSFER_SERVICES.map((s) => (
            <option key={s} value={s}>
              {SERVICE_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 block text-sm font-medium text-ink">
        Transfer reference number
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g. 4471829"
          className="mt-1.5 w-full rounded-[10px] border border-hairline bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-clay"
        />
      </label>

      <div className="mt-4">
        <Button onClick={handleSubmit} loading={saving}>
          I&apos;ve sent the payment
        </Button>
      </div>

      <p className="mt-3 text-xs text-faint">
        Nothing is charged automatically, and your plan only starts once we
        confirm the transfer.
      </p>
    </div>
  );
}

export function PlansClient() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[] | null>(null);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [busyPlan, setBusyPlan] = useState<PlanCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPlans()
      .then((res) => {
        if (!cancelled) setPlans(res);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the plans. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleChoose(planCode: PlanCode, quantity: number) {
    setBusyPlan(planCode);
    setError(null);
    try {
      const created = await createPaymentIntent(planCode, quantity);

      // Two shapes come back and the provider decides which. A hosted
      // checkout gives a URL to send the buyer to; a reference-matching or
      // manual flow gives instructions and nowhere to go. Branching on the
      // response rather than on a hardcoded provider name is what lets a
      // real gateway be plugged in without touching this page.
      if (created.redirect_url) {
        window.location.href = created.redirect_url;
        return;
      }

      setIntent(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start that purchase.");
    } finally {
      setBusyPlan(null);
    }
  }

  const isBooker = user?.role === "planner";

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-hairline bg-surface/85 px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/">
            <FannLockup size={22} textClassName="text-base" />
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-sm font-semibold text-clay-deep">
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="text-sm font-semibold text-clay-deep">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="text-2xl font-bold text-ink">Plans</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Browsing is free. A plan unlocks artist names, contact details, social
          links and messaging — everything you need to actually book someone.
          Every plan unlocks the same thing; they differ in how long they last.
        </p>

        {error && (
          <div className="mt-4">
            <Banner kind="error">{error}</Banner>
          </div>
        )}

        {intent ? (
          <div className="mt-6 max-w-lg">
            <TransferInstructions intent={intent} />
          </div>
        ) : (
          <div className="mt-6">
            {!plans ? (
              <p className="py-10 text-sm text-muted">Loading plans…</p>
            ) : (
              <>
                <PlanCards
                  plans={plans}
                  onChoose={isBooker ? handleChoose : undefined}
                  busyPlan={busyPlan}
                />

                {!user && (
                  <div className="mt-5 rounded-2xl border border-hairline bg-surface p-5 text-center">
                    <p className="text-sm text-muted">
                      Sign in as a planner to buy a plan.
                    </p>
                    <Link
                      href="/auth/login"
                      className="mt-3 inline-block rounded-[10px] bg-clay-deep px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Sign in
                    </Link>
                  </div>
                )}

                {user && !isBooker && (
                  <p className="mt-5 rounded-2xl border border-hairline bg-surface p-5 text-center text-sm text-muted">
                    Plans are for planners. As an artist your profile is free —
                    planners subscribe in order to reach you.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
