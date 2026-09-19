/**
 * The category badge palette.
 *
 * Three deep fills with white on them, not six pale ones with a matching
 * tint of their own hue. The pale set was six unrelated pastels chosen per
 * category, which meant the badge colour looked like it MEANT something —
 * it did not, it was a hash — and every pair had to be contrast-checked
 * separately. These three are the same fills the browse cards use, so a
 * category badge and the card it came from are recognisably the same family.
 *
 * White on each, measured:
 *
 *   --teal        #0F4F4C    9.36
 *   --card-plum   #5F2352   11.36
 *   --card-indigo #1F2F6B   12.52
 *
 * The badge sits on top of a photograph, so the fill is opaque and the text
 * contrast is against the fill, not against whatever is underneath.
 */
const BADGE_COLORS = ["bg-teal text-white", "bg-card-plum text-white", "bg-card-indigo text-white"];

/**
 * Same hash as before: sum the code points, modulo the palette length. It is
 * stable for a given label, which is all that is asked of it — a category
 * keeps its colour across the roster and across reloads.
 */
export function badgeColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash + label.charCodeAt(i)) % BADGE_COLORS.length;
  return BADGE_COLORS[hash];
}
