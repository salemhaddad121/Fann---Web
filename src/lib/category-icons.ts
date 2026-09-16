/**
 * The icons a category group is allowed to use.
 *
 * `category_groups.icon` is a free-text varchar in the API's database, set
 * by migration, and rendered straight into `className={\`ti ${g.icon}\`}`.
 * That is a problem for a self-hosted icon font: the font ships a SUBSET
 * built from the names this source tree asks for (scripts/build-icon-font.mjs),
 * so a name that only ever exists as a database row is not in it and renders
 * as nothing at all — silently, on the category row of /search, which is the
 * most-used control on the most-used page.
 *
 * This list is what closes that gap. It is not decoration:
 *
 *   1. The generator scans source for `ti-` names, so listing them here is
 *      what actually gets these glyphs into the shipped font.
 *   2. `categoryIcon()` validates against it at render time, so a database
 *      row naming something outside this list renders NO icon rather than a
 *      blank tofu box where an icon should be.
 *
 * ADDING A CATEGORY ICON: add it here, then re-run the generator
 * (`node scripts/build-icon-font.mjs <unpacked tabler package>`).
 * `npm run check:icons` will fail if you forget the second step.
 *
 * Kept in step by hand with fann-api's category seed data. That is a real
 * coupling across two repos, and the check above is what makes forgetting it
 * loud instead of invisible.
 */
const CATEGORY_ICONS = [
  "ti-camera",
  "ti-device-speaker",
  "ti-dots-circle-horizontal",
  "ti-masks-theater",
  "ti-music",
  "ti-star",
] as const;

const ALLOWED = new Set<string>(CATEGORY_ICONS);

/**
 * The icon class for a category group, or null if it names one we do not
 * ship. Null renders nothing, which is the honest outcome — better than an
 * empty box that reads as a broken image.
 */
export function categoryIcon(icon: string | null | undefined): string | null {
  if (!icon) return null;
  return ALLOWED.has(icon) ? icon : null;
}
