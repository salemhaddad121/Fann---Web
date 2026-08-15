"use client";

import { useState } from "react";

/**
 * Static FAQ.
 *
 * Content lives here rather than in the database on purpose: there is no
 * CMS, nobody is editing these at runtime, and a table would mean an admin
 * screen to maintain answers that change a few times a year. The answers
 * reflect what the product actually does today — the plan tiers, the
 * masking rules, the manual payment flow — so they should be revisited
 * whenever those change.
 */
const FAQS: { question: string; answer: string }[] = [
  {
    question: "Does it cost anything to browse?",
    answer:
      "No. Searching and viewing artist profiles is free and does not need an account. What a plan unlocks is the artist's full name, their contact details and social links, and the ability to message them directly.",
  },
  {
    question: "Why is the artist's name shortened?",
    answer:
      "Full names are shown to subscribers only. You can still see the artist's work, categories, city, rating, deposit and cancellation policy without a plan — enough to decide whether they are right for your event.",
  },
  {
    question: "What do the plans cost?",
    answer:
      "A day pass is $5 and unlocks everything for 24 hours. A month is $15 and a year is $100. Every plan unlocks the same things; they differ only in how long they last.",
  },
  {
    question: "When does my day pass start?",
    answer:
      "When you choose. Day passes are bought as credits and sit unused until you activate one — the 24 hours begins at that moment, not when you paid. You can buy several and keep them.",
  },
  {
    question: "What happens if I buy a plan while one is already running?",
    answer:
      "The new one is queued and starts when your current plan ends, so nothing overlaps and no time is wasted. A day pass bought while another plan is active is simply kept as a credit.",
  },
  {
    question: "How do I pay?",
    answer:
      "Choose a plan and you will be given an amount and a reference code to quote on the transfer. Once you have sent it, tell us the transfer reference. Payments are confirmed by our team, so there is a short wait before your plan appears.",
  },
  {
    question: "Does Fann take a commission on bookings?",
    answer:
      "No. There are no booking commissions and no hidden fees. Anything you agree with an artist is between you and them.",
  },
  {
    question: "I am an artist — what does it cost me?",
    answer:
      "Nothing. Artist profiles are free. Bookers subscribe in order to reach you.",
  },
  {
    question: "How do I cancel a booking?",
    answer:
      "Cancellation terms are set by each artist and shown on their profile under Booking terms, along with any deposit they require. Message the artist to arrange it.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-hairline bg-surface">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.question} className="border-b border-hairline last:border-b-0">
            <button
              type="button"
              // aria-expanded rather than a styled div, so a screen reader
              // announces the open/closed state instead of silently
              // revealing text.
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-sm font-semibold text-ink">{faq.question}</span>
              <i
                aria-hidden
                className={`ti ti-chevron-down shrink-0 text-base text-faint transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <p className="px-4 pb-4 text-sm leading-relaxed text-ink-soft">{faq.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
