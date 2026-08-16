import Link from "next/link";

/**
 * Shared shell for the marketing pages.
 *
 * Follows the prose conventions LegalDocument already set — a narrow
 * measure, the same type scale, generous line height — rather than
 * inventing a second reading layout. LegalDocument itself is not reused
 * because it carries a consent version and a "this document is not final"
 * banner, neither of which belongs on a page about booking a wedding band.
 *
 * `width` widens the measure for pages that show a grid of profile cards.
 * Text still sits in a narrow column inside it: a 900px line of prose is
 * hard to read no matter how much room the page has.
 */
export function MarketingPage({
  title,
  lead,
  width = "prose",
  children,
}: {
  title: string;
  lead?: string;
  width?: "prose" | "wide";
  children: React.ReactNode;
}) {
  return (
    <main className={`mx-auto px-5 py-10 lg:py-14 ${width === "wide" ? "max-w-5xl" : "max-w-2xl"}`}>
      <h1 className="font-display text-[28px] lg:text-[36px] font-bold leading-[1.15] text-ink">
        {title}
      </h1>
      {lead && (
        <p className="mt-4 max-w-2xl text-[15px] lg:text-base leading-relaxed text-ink/80">{lead}</p>
      )}
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </main>
  );
}

/** A titled block of prose. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-2xl">
      <h2 className="font-display text-[20px] lg:text-[22px] font-bold text-ink">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-[14px] leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}

/** A short list of points, used where prose would turn into a wall. */
export function Points({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <i className="ti ti-point-filled mt-[3px] shrink-0 text-sm text-clay" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The closing call to action.
 *
 * Every marketing page ends in one of these, pointed at a pre-filtered
 * search — which only works because the search page reads its own query
 * string as of the previous wave.
 */
export function CallToAction({
  heading,
  body,
  href,
  label,
}: {
  heading: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <section className="max-w-2xl rounded-[18px] border border-hairline bg-surface/85 p-6 lg:p-7">
      <h2 className="font-display text-[20px] font-bold text-ink">{heading}</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{body}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-1.5 rounded-[10px] bg-ink px-5 py-3 text-sm font-semibold text-white"
      >
        {label} <i className="ti ti-arrow-right text-base" aria-hidden />
      </Link>
      <p className="mt-2 text-xs text-faint">No account needed to browse.</p>
    </section>
  );
}
