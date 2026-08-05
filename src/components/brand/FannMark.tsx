// The Maqam logo mark: a crescent arc inside a thin ring. The design brief
// describes it as reading three ways at once — an abstracted oud soundhole,
// a welcome arc, and the curve of the "n" that the wordmark already leans on.
//
// Geometry is pinned to the 42x42 viewBox the design drew it at and scaled
// via width/height, so stroke weights stay proportional at every size rather
// than going spindly when rendered small.

type MarkVariant = "default" | "on-ink" | "solid";

export function FannMark({
  size = 34,
  variant = "default",
  withDots = false,
  title,
  className = "",
}: {
  size?: number;
  variant?: MarkVariant;
  /** The two terminal dots from the design's primary lockup. Off by default —
   *  below roughly 28px they collapse into the ring and just read as noise. */
  withDots?: boolean;
  /** Supply only when the mark stands alone. Paired with the wordmark it is
   *  decorative, and a second "Fann" for screen readers is just a stutter. */
  title?: string;
  className?: string;
}) {
  const a11y = title
    ? ({ role: "img" as const, "aria-label": title })
    : ({ "aria-hidden": true as const, focusable: "false" as const });

  // App and favicon mark — a filled disc with a knocked-out arc. The outlined
  // variant's 1.6px ring vanishes at favicon sizes, so this one carries the
  // weight instead of scaling the outline down.
  if (variant === "solid") {
    return (
      <svg width={size} height={size} viewBox="0 0 42 42" className={className} {...a11y}>
        <circle cx="21" cy="21" r="20" fill="var(--clay-deep)" />
        <path
          d="M10 21 A11 11 0 0 1 32 21"
          fill="none"
          stroke="var(--sand)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // On the dark ink panel the two-tone treatment loses its contrast, so the
  // design collapses ring and arc to a single light clay.
  const onInk = variant === "on-ink";
  const ring = onInk ? "var(--clay-light)" : "var(--clay-deep)";
  const arc = onInk ? "var(--clay-light)" : "var(--clay)";

  return (
    <svg width={size} height={size} viewBox="0 0 42 42" className={className} {...a11y}>
      <circle cx="21" cy="21" r="19" fill="none" stroke={ring} strokeWidth="1.6" />
      <path
        d="M7 21 A14 14 0 0 1 35 21"
        fill="none"
        stroke={arc}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {withDots && (
        <>
          <circle cx="7" cy="21" r="2" fill={ring} />
          <circle cx="35" cy="21" r="2" fill={arc} />
        </>
      )}
    </svg>
  );
}

// The "fan" + accented "n" wordmark the product already used, kept as a
// component so the accent color follows the role rather than being retyped
// at each call site.
export function FannWordmark({
  onInk = false,
  className = "",
}: {
  onInk?: boolean;
  className?: string;
}) {
  return (
    <span className={`font-display font-bold ${onInk ? "text-surface" : "text-ink"} ${className}`}>
      fan<span className={onInk ? "text-clay-light" : "text-clay"}>n</span>
    </span>
  );
}

// Mark + wordmark, the horizontal lockup used in the auth panel and the
// landing nav.
export function FannLockup({
  size = 28,
  onInk = false,
  withDots = false,
  className = "",
  textClassName = "text-2xl",
}: {
  size?: number;
  onInk?: boolean;
  withDots?: boolean;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <FannMark size={size} variant={onInk ? "on-ink" : "default"} withDots={withDots} />
      <FannWordmark onInk={onInk} className={textClassName} />
    </span>
  );
}
