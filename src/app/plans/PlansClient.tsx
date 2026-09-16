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
import { formatUsd, formatVatRate } from "@/lib/format";
import {
  TRANSFER_SERVICES,
  type PaymentIntent,
  type PaymentRecipient,
  type PlanCode,
  type SubscriptionPlan,
  type TransferService,
} from "@/types/subscriptions";

// Only what is offered. The admin panel keeps its own map covering OMT and
// Western Union so historical payments still render — see PaymentsTab.tsx.
const SERVICE_LABELS: Record<TransferService, string> = {
  Wish: "Whish Money",
  other: "Other",
};

/**
 * Where the money goes.
 *
 * Rendered from the API's structured `recipient` rather than parsed out of
 * the instruction string, so the account number can be given its own line,
 * its own weight and a copy button.
 *
 * When the API sends no recipient — the WHISH_* environment variables are
 * unset — this says so plainly instead of rendering an empty card. A
 * heading above two blank lines reads as a broken page; a buyer who is
 * told the details are missing at least knows to ask, and the API logs the
 * same condition at error level.
 */
function RecipientBlock({ recipient }: { recipient: PaymentRecipient | null }) {
  const [copied, setCopied] = useState(false);

  if (!recipient) {
    return (
      <div className="mt-4 rounded-xl border border-[#FCA5A5] bg-danger-bg p-4">
        <p className="text-sm font-semibold text-danger">
          Payment details are temporarily unavailable
        </p>
        <p className="mt-1 text-sm text-danger">
          Don&apos;t transfer anything yet. Contact support with reference code{" "}
          <span className="font-mono font-semibold">above</span> and we&apos;ll send
          you the account details.
        </p>
      </div>
    );
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(recipient!.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked in some browsers and every insecure origin.
      // The number is on screen and selectable either way, so there is
      // nothing to tell the user — the button just does not confirm.
    }
  }

  return (
    <div className="mt-4 rounded-xl border-2 border-clay bg-sand p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-clay-deep">
        Send the transfer to
      </p>

      <dl className="mt-2.5 space-y-2">
        <div>
          <dt className="text-xs text-faint">Service</dt>
          <dd className="text-sm font-semibold text-ink">{recipient.service}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Account name</dt>
          <dd className="text-sm font-semibold text-ink">{recipient.accountName}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Account number</dt>
          <dd className="flex items-center gap-2">
            <span className="font-mono text-base font-bold tracking-wide text-ink">
              {recipient.accountNumber}
            </span>
            <button
              type="button"
              onClick={copyNumber}
              className="rounded-md border border-hairline bg-surface px-2 py-1 text-xs font-semibold text-clay-deep"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </dd>
        </div>
        {recipient.reference && (
          <div>
            <dt className="text-xs text-faint">Branch / reference</dt>
            <dd className="text-sm font-semibold text-ink">{recipient.reference}</dd>
          </div>
        )}
      </dl>

      {/* What happens if it goes wrong. A transfer is irreversible from the
          buyer's side, so "what if this fails" is the question they are
          holding when they decide whether to send it. */}
      <p className="mt-3 border-t border-hairline pt-2.5 text-xs text-muted">
        {recipient.ifItFails}
      </p>
    </div>
  );
}

/**
 * Payment instructions.
 *
 * The account code is the loudest thing on this screen deliberately: it is
 * the only way an incoming transfer gets matched back to an account, and a
 * transfer that arrives without it has to be reconciled by hand.
 */
function TransferInstructions({ intent }: { intent: PaymentIntent }) {
  // Whish is the only service offered, so it is the default rather than
  // something the buyer has to notice and change.
  const [service, setService] = useState<TransferService>("Wish");
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
        {/* The plan cards advertise the NET price, so this is the first
            screen where the buyer sees what they will actually transfer.
            Showing the arithmetic rather than one larger number is the
            difference between a tax line and an unexplained increase.

            Suppressed entirely at a zero rate: a "VAT 0% — $0.00" row on
            every receipt is noise, and it implies a registration Fann may
            not hold yet. */}
        {intent.vat_rate > 0 && (
          <>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-faint">Subtotal</dt>
              <dd className="text-sm text-ink">{formatUsd(intent.subtotal_usd)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-faint">
                VAT {formatVatRate(intent.vat_rate)}
              </dt>
              <dd className="text-sm text-ink">{formatUsd(intent.vat_usd)}</dd>
            </div>
          </>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-sm text-faint">
            {intent.vat_rate > 0 ? "Total to transfer" : "Amount"}
          </dt>
          <dd className="text-lg font-bold text-ink">
            {formatUsd(intent.amount_usd)} {intent.currency}
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

      {/* Who to pay. The most prominent block after the amount, because
          without it this screen tells a buyer exactly how much to transfer
          and nothing about where — which is where every booker who decided
          to buy stopped. */}
      <RecipientBlock recipient={intent.recipient} />

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
