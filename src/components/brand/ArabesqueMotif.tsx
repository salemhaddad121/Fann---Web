// The Maqam background motif: a hand-drawn wave/arc line paired with an
// oud-soundhole shape. The design uses the *same* motif on both sides of the
// marketplace and swaps only the line color — one cohesive brand with a
// subtle role cue, rather than two separate themes.
//
// Drawn once here because the auth panel, the landing hero and the app page
// background all render it; they differ only in viewBox and opacity.

export function ArabesqueMotif({
  role = "artist",
  className = "",
  opacity = 1,
}: {
  role?: "artist" | "planner";
  className?: string;
  opacity?: number;
}) {
  const line = role === "planner" ? "var(--teal)" : "var(--clay)";
  const lineDeep = role === "planner" ? "var(--teal-deep)" : "var(--clay-deep)";

  return (
    <svg
      className={className}
      viewBox="0 0 340 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
      style={{ opacity }}
    >
      <path
        d="M-10 160 Q60 90 130 150 T280 110 T360 140"
        fill="none"
        stroke={line}
        strokeWidth="1.4"
        opacity="0.55"
      />
      <path
        d="M-10 60 Q80 130 170 55 T360 90"
        fill="none"
        stroke={lineDeep}
        strokeWidth="1"
        opacity="0.35"
      />
      <circle cx="60" cy="40" r="18" fill="none" stroke={line} strokeWidth="1" opacity="0.4" />
      <circle cx="290" cy="150" r="26" fill="none" stroke={lineDeep} strokeWidth="1" opacity="0.3" />
      {/* The oud soundhole — the same silhouette the logo mark abstracts. */}
      <path
        d="M250 40 q10 -14 20 0 q10 14 -10 20 q-20 -6 -10 -20z"
        fill="none"
        stroke={line}
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  );
}
