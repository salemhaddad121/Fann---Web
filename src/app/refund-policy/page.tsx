import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { CONSENT_VERSIONS } from "@/lib/consent-versions";

// Bare title — the root layout's template appends the brand.
export const metadata: Metadata = {
  title: "Refund Policy",
  alternates: { canonical: "/refund-policy" },
};

/**
 * Versioned with the Terms rather than on its own date. This policy has no
 * separate acceptance step — it is the refund half of what buying Paid
 * Access agrees to — so giving it an independent version would create a
 * revision nobody ever accepted and nothing ever recorded.
 */
export default function RefundPolicyPage() {
  return (
    <LegalDocument
      title="Refund Policy"
      version={CONSENT_VERSIONS.terms}
      status="pending-review"
    >
      <p>
        Paid Access buys access to the Fann platform for a fixed period: the
        ability to see artists&apos; full names and contact details, to message
        them directly, and to send booking requests. It does not buy a
        booking, a reply, or any particular outcome with an artist.
      </p>

      <p className="font-semibold text-ink">What is not refundable</p>
      <p>
        Because what you buy is the access itself, a plan is not refunded
        for:
      </p>
      <ul className="list-disc pl-5 flex flex-col gap-1.5">
        <li>dissatisfaction with an artist, or with the platform;</li>
        <li>an artist not being available for your date;</li>
        <li>an artist being slow to respond, or not responding at all;</li>
        <li>an artist&apos;s conduct before, during or after an event;</li>
        <li>a booking not going ahead, for any reason.</li>
      </ul>
      <p>
        Any agreement about a booking — including deposits, fees and
        cancellation between you and an artist — is between the two of you.
        Fann is not a party to it and does not refund it.
      </p>

      <p className="font-semibold text-ink">What is refundable</p>
      <p>A payment is refunded where:</p>
      <ul className="list-disc pl-5 flex flex-col gap-1.5">
        <li>you were charged twice for the same plan;</li>
        <li>you were charged an amount other than the price shown;</li>
        <li>
          a plan you paid for failed to activate for a reason attributable to
          Fann.
        </li>
      </ul>
      <p>
        Refunds are returned by the same route the payment arrived, to the
        account it came from.
      </p>

      <p className="font-semibold text-ink">Your statutory rights</p>
      <p>
        Nothing in this policy removes or limits any right you have under
        Lebanese consumer protection law. Where that law gives you a right to
        a refund, it applies regardless of what is written above.
      </p>

      <p className="font-semibold text-ink">Asking for a refund</p>
      <p>
        Write to{" "}
        <a
          href="mailto:admin@fann-leb.com"
          className="font-semibold text-clay-deep underline"
        >
          admin@fann-leb.com
        </a>{" "}
        with the reference code you quoted on your transfer and the date you
        paid. Those two together are what let us find the payment.
      </p>
    </LegalDocument>
  );
}
