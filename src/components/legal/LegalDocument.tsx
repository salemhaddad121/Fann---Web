import Link from "next/link";
import { LEGAL_ENTITY } from "@/lib/legal-entity";

// Shared shell for /terms and /privacy.
//
// The real wording isn't written yet, so these are honest placeholders
// rather than invented legal text — stating that the final document is
// pending is safer than shipping plausible-looking terms nobody drafted.
//
// `version` must match CONSENT_VERSIONS in the API (fann-api
// src/consent/consent.constants.ts). It's displayed because a user asked to
// agree to something is entitled to see which revision that is, and because
// it makes a mismatch with the stored consent visible rather than silent.
/**
 * Why the banner varies.
 *
 * `placeholder` is for a page whose wording nobody has written — /terms and
 * /privacy today. `pending-review` is for one whose wording IS the intended
 * policy and is waiting on a lawyer, which is where /refund-policy sits.
 * Showing "this is a placeholder" over real drafted terms would tell readers
 * to disregard something they are in fact bound by, and showing
 * "awaiting review" over invented filler would claim more than exists.
 */
export type LegalStatus = "placeholder" | "pending-review";

const STATUS_COPY: Record<LegalStatus, { heading: string; body: string }> = {
  placeholder: {
    heading: "This document is not final.",
    body:
      "The wording below is a placeholder while the final text is being " +
      "prepared. It is published so the signup flow can record which " +
      "version you agreed to, and will be replaced by the complete document.",
  },
  "pending-review": {
    heading: "This document is awaiting legal review.",
    body:
      "The wording below is the policy Fann intends to operate and is " +
      "published so it can be read before you pay. It has not yet been " +
      "reviewed by a licensed Lebanese attorney, and may change as a result.",
  },
};

export function LegalDocument({
  title,
  version,
  status = "placeholder",
  children,
}: {
  title: string;
  version: string;
  status?: LegalStatus;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <Link href="/" className="font-display text-xl font-bold text-ink">
        fan<span className="text-clay">n</span>
      </Link>

      <h1 className="mt-8 text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-1 text-xs text-faint">Version {version}</p>

      <div className="mt-6 rounded-xl border border-[#FCA5A5] bg-danger-bg p-4">
        <p className="text-sm font-semibold text-danger mb-1">
          {STATUS_COPY[status].heading}
        </p>
        <p className="text-xs text-muted leading-relaxed">
          {STATUS_COPY[status].body}
        </p>
      </div>

      <div className="mt-6 text-[13px] text-muted leading-relaxed flex flex-col gap-3">
        {children}
      </div>

      <EntityDetails />
    </div>
  );
}

/**
 * Who the user is contracting with (T&C §1 and §35).
 *
 * On every legal page rather than only the Terms: someone reading the refund
 * policy to decide whether to pay is exactly the person who needs to know who
 * is taking the money and where to chase it.
 *
 * The number is shown once with the WhatsApp mark beside it because the
 * support line and the WhatsApp account are the same number — listing it
 * twice under two headings would imply two channels that do not exist. It is
 * a tel: link with a wa.me link alongside, so both do the obvious thing on a
 * phone.
 */
function EntityDetails() {
  return (
    <div className="mt-10 border-t border-hairline pt-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
        Operated by
      </p>

      <dl className="mt-2 flex flex-col gap-1.5 text-xs text-muted">
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-faint">Platform</dt>
          <dd className="font-medium text-ink">{LEGAL_ENTITY.name}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-faint">Legal representative</dt>
          <dd>
            {LEGAL_ENTITY.representative}
            <span className="text-faint"> — {LEGAL_ENTITY.representativeCapacity}</span>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-faint">Registered address</dt>
          <dd>{LEGAL_ENTITY.address}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-faint">Email</dt>
          <dd>
            <a
              href={`mailto:${LEGAL_ENTITY.email}`}
              className="font-semibold text-clay-deep underline"
            >
              {LEGAL_ENTITY.email}
            </a>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-faint">Telephone</dt>
          <dd className="flex items-center gap-1.5">
            <a
              href={`tel:${LEGAL_ENTITY.phoneE164}`}
              className="font-semibold text-clay-deep underline"
            >
              {LEGAL_ENTITY.phone}
            </a>
            <a
              href={`https://wa.me/${LEGAL_ENTITY.phoneE164}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#25D366]"
              aria-label="Message this number on WhatsApp"
              title="Also on WhatsApp"
            >
              <i className="ti ti-brand-whatsapp text-base" aria-hidden />
            </a>
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-faint">
        Questions about this document? Contact{" "}
        <a
          href={`mailto:${LEGAL_ENTITY.email}`}
          className="font-semibold text-clay-deep underline"
        >
          {LEGAL_ENTITY.email}
        </a>
        .
      </p>
    </div>
  );
}
