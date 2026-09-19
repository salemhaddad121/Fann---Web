import { DOODLES, type DoodleVariant } from "@/components/brand/doodle-art";

/**
 * One mascot doodle, hung off an edge of its parent.
 *
 * Decorative, always. It renders aria-hidden with no role and no label,
 * takes no pointer events, and is absolutely positioned — it must never
 * affect layout. A doodle that grows a card when its title wraps is a bug,
 * which is why the parent needs `relative` and `overflow-visible` and why
 * there is no flow-participating version of this.
 *
 * COLOUR is --doodle and nothing else. There is deliberately no `opacity`
 * prop: the token is already tuned to sit at the reference drawing's weight
 * on all three grounds it may appear over (3.03 on mint, 3.40 on sand, 3.78
 * on white), and stacking an alpha on top would compound with it and make
 * the drawing change weight depending on which ground it landed on. If a
 * doodle looks too strong somewhere, it is on the wrong ground — move it,
 * do not fade it.
 *
 * EDGE is fixed per pose (see doodle-art.ts) rather than a free choice. Each
 * pose is drawn for one edge: mic sits above a rule, rest rests its chin on
 * a card's bottom, walk trots out from underneath, peek leans round a side.
 * Letting a caller hang the resting pose off a vertical edge would only ever
 * produce a mistake, so the type does not offer it.
 */
export function MascotDoodle({
  variant,
  offset,
  width,
  overhang,
  flip = false,
  hideBelow,
  className = "",
}: {
  variant: DoodleVariant;
  /** Position along the pose's own edge, e.g. "12px" | "44%" | "-4px". */
  offset: string;
  /** px. Height comes from the pose's aspect ratio. */
  width: number;
  /** Percent of its own size crossing the edge. Defaults per pose. */
  overhang?: number;
  flip?: boolean;
  /** Drop the doodle on narrow screens rather than shrinking it. */
  hideBelow?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pose = DOODLES[variant];
  const height = Math.round(width / pose.aspect);
  const cross = `${overhang ?? pose.overhang}%`;

  // Where it sits, and how far it spills over. `rest` is the exception the
  // plan calls out: it sits INSIDE the card with its chin on the bottom
  // edge, so it anchors at bottom:0 rather than bottom:100%.
  const place: React.CSSProperties =
    variant === "rest"
      ? { bottom: 0, left: offset }
      : pose.edge === "bottom"
        ? { bottom: "100%", left: offset, transform: `translateY(${cross})` }
        : pose.edge === "top"
          ? { top: "100%", left: offset, transform: `translateY(calc(-1 * ${cross}))` }
          : pose.edge === "right"
            ? { left: "100%", top: offset, transform: `translateX(calc(-1 * ${cross}))` }
            : { right: "100%", top: offset, transform: `translateX(${cross})` };

  if (flip) {
    place.transform = `${place.transform ?? ""} scaleX(-1)`.trim();
  }

  const hidden =
    hideBelow === "lg"
      ? "hidden lg:block"
      : hideBelow === "md"
        ? "hidden md:block"
        : hideBelow === "sm"
          ? "hidden sm:block"
          : "";

  return (
    <svg
      // Above the page ground, below text and controls.
      className={`pointer-events-none absolute z-0 text-doodle ${hidden} ${className}`.trim()}
      style={place}
      width={width}
      height={height}
      viewBox={pose.viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <use href={`#${pose.id}`} />
    </svg>
  );
}
