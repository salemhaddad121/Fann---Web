import Link from "next/link";

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

      <p className="mt-10 text-xs text-faint">
        Questions about this document? Contact{" "}
        <a href="mailto:admin@fann-leb.com" className="font-semibold text-clay-deep underline">
          admin@fann-leb.com
        </a>
        .
      </p>
    </div>
  );
}
