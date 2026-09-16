"use client";

import { useState } from "react";
import Link from "next/link";
import type { PlanCode, SubscriptionPlan } from "@/types/subscriptions";
import { PLAN_COPY } from "@/lib/plan-copy";

/**
 * The three-card pricing block.
 *
 * A note on the content, because it is not the usual feature matrix: Fann's
 * plans all unlock exactly the same thing. They differ in how long they
 * last, not in what they let you do. Inventing tier-gated features to fill
 * three columns would be a lie the product does not back up, so the cards
 * are built around the three differences that are real — the message cap on
 * day passes, the ID requirement on the longer plans, and what each works
 * out to per day — plus the honest saving on the yearly.
 *
 * Names and taglines come from lib/plan-copy.ts, which the landing page's
 * summary block reads too.
 *
 * Everything except the wording is derived from the plan rows the API
 * returns, so a price or cap change in the database moves the page.
 */

function perDay(plan: SubscriptionPlan): string {
  return `$${(plan.price_usd / plan.duration_days).toFixed(2)} per day`;
}

/**
 * The saving on the yearly, or null.
 *
 * Only ever claims a saving that can be shown from the price list itself —
 * twelve months at the monthly rate, less the yearly price. If the monthly
 * plan is missing from the response, or the maths comes out at zero, the
 * line is dropped rather than rounded into existence.
 */
function savingAgainstMonthly(plan: SubscriptionPlan, all: SubscriptionPlan[]): string | null {
  if (plan.code !== "year") return null;
  const month = all.find((p) => p.code === "month");
  if (!month) return null;
  const saving = month.price_usd * 12 - plan.price_usd;
  return saving > 0 ? `Saves $${saving.toFixed(0)} against paying monthly` : null;
}

/**
 * The subline under the headline price.
 *
 * "$0.50 per day", "$0.27 per day" and "Saves $80 against paying monthly"
 * are the strongest persuasion on this page, and they used to sit as the
 * seventh and eighth checkmark rows of a twenty-one row list, set in 12px
 * grey. They belong against the number they are talking about.
 *
 * Nothing for the day pass: it is one day, so "per day" is the price again.
 */
function priceSubline(plan: SubscriptionPlan, all: SubscriptionPlan[]): string | null {
  if (plan.code === "day") return null;
  const saving = savingAgainstMonthly(plan, all);
  return saving ? `${perDay(plan)} · ${saving}` : perDay(plan);
}

/**
 * What every plan includes, listed ONCE below the grid.
 *
 * The three cards used to carry twenty-one feature rows between them while
 * only three things actually differ. "Artist names, contact details and
 * social links" and "Message artists directly" appeared, identically, on all
 * three — so the eye had to diff three near-identical lists to find the one
 * row that changed.
 *
 * Fann's plans unlock exactly the same thing; they differ in how long they
 * last. Saying that once, plainly, is both shorter and more honest than
 * repeating it three times and hoping nobody compares.
 */
const SHARED_FEATURES = [
  "Artist names, contact details and social links",
  "Message artists directly",
  "No booking commissions, ever",
];

/**
 * The rows that are actually different between plans.
 *
 * Deliberately NOT phrased as "Everything in Day Pass, plus —": the plans
 * are not additive. The longer plans lift the day pass's message cap but
 * also REQUIRE ID verification, which the day pass does not. Presenting a
 * requirement as a bonus feature would be the kind of claim this page has
 * otherwise been careful not to make.
 */
function differencesFor(plan: SubscriptionPlan): string[] {
  const rows: string[] = [
    plan.code === "day" ? "Full access for 24 hours" : `Full access for ${plan.duration_days} days`,
    plan.message_cap === null ? "Unlimited messages" : `Up to ${plan.message_cap} messages`,
    plan.requires_id_doc ? "ID verification required" : "No ID verification needed",
  ];

  rows.push(
    plan.code === "day"
      ? "Buy a pack — start each one whenever you need it"
      : "Stacks on after your current plan, never overlaps it",
  );

  return rows;
}

function Check({ featured }: { featured: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
        featured ? "bg-white/25 text-white" : "bg-clay/15 text-clay-deep"
      }`}
    >
      ✓
    </span>
  );
}

interface PlanCardsProps {
  plans: SubscriptionPlan[];
  onChoose?: (planCode: PlanCode, quantity: number) => void;
  /**
   * Where a card's action goes when there is no purchase flow on the page —
   * the landing page shows the same cards but cannot start a payment, so it
   * sends people to /plans instead. Ignored when onChoose is given.
   *
   * Keep this pointing at /plans: the CSS rule that hides pricing links
   * inside the Play app matches on the href, so a link anywhere else would
   * walk straight past it.
   */
  ctaHref?: string;
  /** Label for the per-card action. Guests get a sign-in prompt instead. */
  ctaLabel?: string;
  busyPlan?: PlanCode | null;
  disabled?: boolean;
}

export function PlanCards({
  plans,
  onChoose,
  ctaHref,
  ctaLabel = "Choose this plan",
  busyPlan = null,
  disabled = false,
}: PlanCardsProps) {
  // Only the day pass is sold in packs — the others are periods, and buying
  // three years at once is a support ticket waiting to happen.
  const [dayQuantity, setDayQuantity] = useState(1);

  // Every plan carries the same rate — it is a property of the seller, not
  // of the product — so one card is enough to ask. Zero means Fann is not
  // charging VAT, and the note stays off: "Excluding VAT" beside a price
  // that excludes nothing is a claim about a registration Fann may not hold.
  const vatRate = plans[0]?.vat_rate ?? 0;

  return (
    <>
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((plan) => {
        const copy = PLAN_COPY[plan.code];
        const featured = Boolean(copy?.featured);
        const quantity = plan.code === "day" ? dayQuantity : 1;
        const subline = priceSubline(plan, plans);

        return (
          <div
            key={plan.code}
            className={`flex flex-col rounded-2xl border p-5 ${
              featured
                ? "border-ink bg-ink text-white"
                : "border-hairline bg-surface text-ink"
            }`}
          >
            {featured && (
              <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-clay-light/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-clay-light">
                Best value
              </span>
            )}

            <p
              className={`text-[11px] font-bold uppercase tracking-wide ${
                featured ? "text-clay-light" : "text-clay-deep"
              }`}
            >
              {copy?.name ?? plan.code}
            </p>

            <p className="mt-1 text-[28px] font-bold leading-tight">
              ${plan.price_usd}
              <span
                className={`ml-1 text-sm font-medium ${featured ? "text-white/70" : "text-faint"}`}
              >
                {plan.code === "day" ? "/ 24 hours" : `/ ${plan.duration_days} days`}
              </span>
            </p>

            {/* Directly under the number it is about — see priceSubline. */}
            {subline && (
              <p
                className={`mt-1 text-[13px] font-semibold ${
                  featured ? "text-clay-light" : "text-clay-deep"
                }`}
              >
                {subline}
              </p>
            )}

            <p className={`mt-1.5 text-sm ${featured ? "text-white/75" : "text-muted"}`}>
              {copy?.tagline}
            </p>

            <ul className="mt-4 flex-1 space-y-2">
              {differencesFor(plan).map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[13px]">
                  <Check featured={featured} />
                  <span className={featured ? "text-white/90" : "text-ink-soft"}>{feature}</span>
                </li>
              ))}
            </ul>

            {plan.code === "day" && onChoose && (
              <div
                className={`mt-4 flex items-center justify-between rounded-[10px] border px-3 py-2 ${
                  featured ? "border-white/25" : "border-hairline"
                }`}
              >
                <span className={`text-[13px] ${featured ? "text-white/80" : "text-muted"}`}>
                  How many?
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="One fewer day pass"
                    disabled={dayQuantity <= 1}
                    onClick={() => setDayQuantity((n) => Math.max(1, n - 1))}
                    className="h-7 w-7 rounded-full border border-hairline text-base font-bold leading-none disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-bold tabular-nums">
                    {dayQuantity}
                  </span>
                  <button
                    type="button"
                    aria-label="One more day pass"
                    disabled={dayQuantity >= 30}
                    onClick={() => setDayQuantity((n) => Math.min(30, n + 1))}
                    className="h-7 w-7 rounded-full border border-hairline text-base font-bold leading-none disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {onChoose && (
              <button
                type="button"
                disabled={disabled || busyPlan !== null}
                onClick={() => onChoose(plan.code, quantity)}
                className={`mt-4 w-full rounded-[10px] py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${
                  featured ? "bg-white text-ink" : "bg-clay-deep text-white"
                }`}
              >
                {busyPlan === plan.code
                  ? "Setting up…"
                  : plan.code === "day" && dayQuantity > 1
                    ? `${ctaLabel} — $${(plan.price_usd * dayQuantity).toFixed(0)}`
                    : ctaLabel}
              </button>
            )}

            {!onChoose && ctaHref && (
              <Link
                href={ctaHref}
                className={`mt-4 w-full rounded-[10px] py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
                  featured ? "bg-white text-ink" : "bg-clay-deep text-white"
                }`}
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        );
      })}
    </div>

    {/* Said once, under the grid, instead of three times inside it. */}
    <div className="mt-4 rounded-2xl border border-hairline bg-surface p-5">
      <p className="text-[13px] font-bold uppercase tracking-wide text-clay-deep">
        Every plan includes
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {SHARED_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[13px]">
            <Check featured={false} />
            <span className="text-ink-soft">{feature}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* One line under the grid rather than three identical ones inside it.
        It also says WHERE the VAT turns up, because the next screen shows a
        larger number than the one just clicked and that should not be a
        surprise. */}
    {vatRate > 0 && (
      <p className="mt-3 text-center text-[11px] text-faint">
        All prices exclude VAT. VAT is added at checkout.
      </p>
    )}
    </>
  );
}
