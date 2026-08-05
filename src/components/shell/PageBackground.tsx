import { ArabesqueMotif } from "@/components/brand/ArabesqueMotif";

// Fixed, full-viewport page backdrop, one per "side" of the marketplace —
// booker (planner) and artist. Sits behind all page content via `-z-10` +
// `position: fixed`; nothing else needs to change z-index, since
// TopNav/BottomNav already paint their own opaque bars on top at a much
// higher z-index (z-50 / z-60).
//
// Maqam replaces the photographic .webp artwork with line art on warm paper.
// Two consequences worth knowing:
//
//   * The white wash is gone. It existed because full-strength illustration
//     behind dark ink-colored text was a real contrast problem for the bits
//     of text that sit directly on the background with no card behind them
//     (e.g. the dashboard greeting). The line art tops out at 0.55 opacity on
//     paper, so there is nothing left to wash out.
//   * The separate mobile/desktop crops are gone too. Those existed because
//     `bg-cover` on a phone-shaped viewport cropped roughly two thirds off
//     the sides of the landscape .webp. An SVG just rescales, so one motif
//     now covers every viewport.
//
// The .webp files are deliberately left in public/backgrounds/ — reverting
// this is a matter of restoring this one file, with no assets to recover.
export function PageBackground({ role }: { role: "artist" | "planner" }) {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 bg-paper">
      <ArabesqueMotif role={role} className="w-full h-full" />
    </div>
  );
}
