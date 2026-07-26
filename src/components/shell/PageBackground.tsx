// Fixed, full-viewport background image, one per "side" of the
// marketplace — booker (planner) and artist. Sits behind all page content
// via `-z-10` + `position: fixed`; nothing else needs to change z-index,
// since TopNav/BottomNav already paint their own opaque white bars on top
// at a much higher z-index (z-50 / z-60).
//
// The white wash baked into the same `background-image` (a layered
// linear-gradient over the url()) exists because some text — e.g. the
// dashboard greeting — sits directly on this background with no opaque
// card behind it. Full-strength illustration behind dark ink-colored text
// would be a real contrast problem, so a white wash is still layered over
// it — but kept light (0.25) so the artwork reads as a clear branded
// wallpaper rather than near-plain-white. Content in opaque cards/fields is
// unaffected; the deliberate tradeoff is that the little text sitting
// directly on the wash (e.g. the dashboard greeting) has less contrast over
// busier areas of the artwork.
// Two crops per role. The desktop artwork is landscape (1586x992) and the
// mobile artwork is portrait (941x1672); `bg-cover` on a phone-shaped
// viewport would otherwise crop roughly two thirds off the sides of the
// landscape art, which is what was happening before the mobile crops were
// wired up. Swap happens at Tailwind's `sm` (640px).
const BACKGROUND_IMAGE: Record<"artist" | "planner", { mobile: string; desktop: string }> = {
  artist: {
    mobile: "/backgrounds/artist-bg-mobile.webp",
    desktop: "/backgrounds/artist-bg.webp",
  },
  planner: {
    mobile: "/backgrounds/booker-bg-mobile.webp",
    desktop: "/backgrounds/booker-bg.webp",
  },
};

const WHITE_WASH = "linear-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.25))";

export function PageBackground({ role }: { role: "artist" | "planner" }) {
  const art = BACKGROUND_IMAGE[role];
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat sm:hidden"
        style={{ backgroundImage: `${WHITE_WASH}, url(${art.mobile})` }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat hidden sm:block"
        style={{ backgroundImage: `${WHITE_WASH}, url(${art.desktop})` }}
      />
    </>
  );
}
