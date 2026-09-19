import { DOODLES } from "@/components/brand/doodle-art";

/**
 * All four mascot poses, defined once.
 *
 * Mounted a single time in the root layout. Every MascotDoodle on the page
 * is then a `<use href="#dl-…">` costing a few dozen bytes, instead of
 * another copy of the path.
 *
 * That matters here: the four poses are ~37KB of path data between them.
 * Inlining the path per placement would ship it again for every doodle, and
 * Phase 10 puts one on several pages.
 *
 * Renders nothing visible — a zero-sized, absolutely-positioned <svg> whose
 * only job is to hold the <defs>. It must stay out of the layout, hence the
 * explicit 0/0 and position:absolute rather than `hidden`: `display:none`
 * on an SVG makes its <defs> unreferenceable in some engines.
 */
export function MascotSprite() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {Object.values(DOODLES).map((pose) => (
          <path key={pose.id} id={pose.id} fillRule="evenodd" d={pose.d} />
        ))}
      </defs>
    </svg>
  );
}
