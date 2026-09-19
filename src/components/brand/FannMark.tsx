import { FANN_LOGO, FANN_DOG, type BrandArt } from "@/components/brand/brand-art";

/**
 * The Fann brand marks.
 *
 * This replaced the old crescent-in-a-ring mark and the separate "fan" + "n"
 * text wordmark. The lettering now lives INSIDE the artwork, so there is no
 * longer a text node to colour — which is why FannWordmark is an alias here
 * rather than a component (see below).
 *
 * COLOUR. The wordmark is mango on every ground, and ink only when the
 * ground itself is mango:
 *
 *   mint / white / sand   --mango    1.57 / 1.96 / 1.76
 *   ink                   --mango    9.05
 *   mango                 --ink      9.05
 *
 * The three tonal ones are deliberate and allowed: WCAG 2.2 exempts
 * logotypes from SC 1.4.3 and SC 1.4.11 outright — "text that is part of a
 * logo or brand name has no contrast requirement". The consequence is
 * optical rather than legal, and it is paid for with the size floor below,
 * not with a different colour.
 *
 * SIZE. `size` is the rendered HEIGHT in px; the width comes from the
 * artwork's own aspect ratio. The floor is 40px, 56px wherever the layout
 * allows. Below 40 the lettering and the dog collapse into each other, and
 * at 1.57:1 there is no contrast headroom to carry a mushy shape.
 *
 * Anywhere that cannot fit 40px — a tight sticky header, an inline badge —
 * use `FannIcon` instead. It is the dog alone, which survives small sizes
 * because it is one shape rather than five letters and a dog.
 */

type MarkVariant = "default" | "on-mango" | "on-ink" | "solid";

/** Every variant is one text-* class on one asset, because the art is
 *  currentColor. `on-ink` is kept as an alias of default for call-site
 *  compatibility — on ink, mango is already right at 9.05:1. */
function colourFor(variant: MarkVariant): string {
  if (variant === "on-mango") return "text-ink";
  if (variant === "solid") return ""; // caller supplies the colour
  return "text-mango"; // default and on-ink
}

function Art({
  art,
  size,
  variant,
  title,
  className,
}: {
  art: BrandArt;
  size: number;
  variant: MarkVariant;
  title?: string;
  className: string;
}) {
  // Titled marks are images to assistive tech; untitled ones are decorative,
  // because the visible brand name is almost always already in the DOM beside
  // them and a second "Fann" is just a stutter.
  const a11y = title
    ? ({ role: "img" as const, "aria-label": title })
    : ({ "aria-hidden": true as const, focusable: "false" as const });

  return (
    <svg
      height={size}
      width={Math.round(size * art.aspect)}
      viewBox={art.viewBox}
      fill="currentColor"
      fillRule="evenodd"
      className={`${colourFor(variant)} ${className}`.trim()}
      {...a11y}
    >
      <path d={art.d} />
    </svg>
  );
}

/**
 * The dachshund on its own.
 *
 * This is what to use below the lockup's 40px floor, and it is the shape the
 * app icon is built from. `size` is the height, as everywhere here.
 */
export function FannIcon({
  size = 28,
  variant = "default",
  title,
  className = "",
}: {
  size?: number;
  variant?: MarkVariant;
  title?: string;
  className?: string;
}) {
  return <Art art={FANN_DOG} size={size} variant={variant} title={title} className={className} />;
}

/**
 * The full lockup — lettering and dog, one piece of artwork.
 *
 * `size` is its HEIGHT. 40 is the floor, 56 where there is room. If a 40px
 * lockup does not fit its container, raise the container; if that is not
 * reasonable, use FannIcon instead. Do not shrink this below 40.
 */
export function FannLockup({
  size = 40,
  variant = "default",
  title,
  className = "",
}: {
  size?: number;
  variant?: MarkVariant;
  title?: string;
  className?: string;
  /**
   * Accepted and ignored, all three. The old lockup was a mark beside a text
   * node; these styled that text and the mark's terminal dots. The artwork
   * now carries its own lettering, so there is nothing left for them to act
   * on. They stay in the type so the call sites did not all have to change
   * shape in the same commit — deliberately NOT destructured, so they raise
   * no unused-variable warning. Cleanup is logged in ISSUES.md.
   */
  textClassName?: string;
  withDots?: boolean;
  onInk?: boolean;
}) {
  return <Art art={FANN_LOGO} size={size} variant={variant} title={title} className={className} />;
}

/**
 * Was the mark half of the old lockup. The artwork is now one piece, so this
 * renders the full lockup and exists only so nothing breaks.
 * @deprecated Use FannLockup, or FannIcon below 40px.
 */
export function FannMark(props: Parameters<typeof FannLockup>[0]) {
  return <FannLockup {...props} />;
}

/**
 * Was the text half. The lettering is inside the artwork now.
 * @deprecated Use FannLockup, or FannIcon below 40px.
 */
export function FannWordmark(props: Parameters<typeof FannLockup>[0]) {
  return <FannLockup {...props} />;
}
