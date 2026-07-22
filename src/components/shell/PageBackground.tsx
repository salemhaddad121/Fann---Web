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
// would be a real contrast problem in places; this keeps every existing
// page exactly as legible as it was on plain white, while still letting
// the artwork read clearly as a branded wallpaper, especially around the
// edges where content doesn't fill the viewport.
const BACKGROUND_IMAGE: Record<"artist" | "planner", string> = {
  artist: "/backgrounds/artist-bg.webp",
  planner: "/backgrounds/booker-bg.webp",
};

export function PageBackground({ role }: { role: "artist" | "planner" }) {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.86), rgba(255,255,255,0.86)), url(${BACKGROUND_IMAGE[role]})`,
      }}
    />
  );
}
