"use client";

import { useState } from "react";
import type { PlanCode, SubscriptionPlan } from "@/types/subscriptions";

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
 * Everything except the wording is derived from the plan rows the API
 * returns, so a price or cap change in the database moves the page.
 */

const PLAN_COPY: Record<PlanCode, { name: string; tagline: string; featured?: boolean }> = {
  day: {
    name: "Day pass",
    tagline: "For one event you're booking right now.",
  },
  month: {
    name: "Monthly",
    tagline: "For planners with something on every few weeks.",
  },
  year: {
    name: "Yearly",
    tagline: "For venues and agencies booking all year round.",
    featured: true,
  },
};

function perDay(plan: SubscriptionPlan): string {
  return `$${(plan.price_usd / plan.duration_days).toFixed(2)} per day`;
}

function featuresFor(plan: SubscriptionPlan, all: SubscriptionPlan[]): string[] {
  const features: string[] = [
    plan.code === "day"
      ? "Full access for 24 hours"
      : `Full access for ${plan.duration_days} days`,
    "Artist names, contact details and social links",
    "Message artists directly",
  ];

  features.push(
    plan.message_cap === null
      ? "Unlimited messages"
      : `Up to ${plan.message_cap} messages`,
  );

  features.push(
    plan.requires_id_doc ? "ID verification required" : "No ID verification needed",
  );

  if (plan.code === "day") {
    features.push("Buy a pack — start each one whenever you need it");
  } else {
    features.push("Stacks on after your current plan, never overlaps it");
    features.push(perDay(plan));
  }

  // Only claim a saving we can actually show from the price list.
  const month = all.find((p) => p.code === "month");
  if (plan.code === "year" && month) {
    const yearlyAtMonthlyRate = month.price_usd * 12;
    const saving = yearlyAtMonthlyRate - plan.price_usd;
    if (saving > 0) {
      features.push(`Saves $${saving.toFixed(0)} against paying monthly`);
    }
  }

  return features;
}

function Check({ featured }: { featured: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
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
  /** Label for the per-card action. Guests get a sign-in prompt instead. */
  ctaLabel?: string;
  busyPlan?: PlanCode | null;
  disabled?: boolean;
}

export function PlanCards({
  plans,
  onChoose,
  ctaLabel = "Choose this plan",
  busyPlan = null,
  disabled = false,
}: PlanCardsProps) {
  // Only the day pass is sold in packs — the others are periods, and buying
  // three years at once is a support ticket waiting to happen.
  const [dayQuantity, setDayQuantity] = useState(1);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((plan) => {
        const copy = PLAN_COPY[plan.code];
        const featured = Boolean(copy?.featured);
        const quantity = plan.code === "day" ? dayQuantity : 1;

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

            <p className={`mt-1 text-sm ${featured ? "text-white/75" : "text-muted"}`}>
              {copy?.tagline}
            </p>

            <ul className="mt-4 flex-1 space-y-2">
              {featuresFor(plan, plans).map((feature) => (
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
          </div>
        );
      })}
    </div>
  );
}
