// The Maqam equalizer accent, taken from the design's concept card: four
// clay bars, 4 wide with 2 gaps, at heights 8/14/6/12 in a 16-tall box.
//
// This replaced an 18-bar, 360x90 flourish that sat in the corner of the
// auth panel. The design treats it as a small inline mark under the tagline
// rather than a large decorative element, so the geometry below is the
// design's exact proportions and the component is sized by height at the
// call site.
const BARS = [
  { height: 8, opacity: 0.6 },
  { height: 14, opacity: 0.8 },
  { height: 6, opacity: 0.5 },
  { height: 12, opacity: 0.7 },
];

const BOX_HEIGHT = 16;
const BAR_WIDTH = 4;
const BAR_GAP = 2;

export function Waveform({ height = 16, className = "" }: { height?: number; className?: string }) {
  const width = BARS.length * BAR_WIDTH + (BARS.length - 1) * BAR_GAP;

  return (
    <svg
      viewBox={`0 0 ${width} ${BOX_HEIGHT}`}
      width={(width / BOX_HEIGHT) * height}
      height={height}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {BARS.map((bar, i) => (
        <rect
          key={i}
          x={i * (BAR_WIDTH + BAR_GAP)}
          y={BOX_HEIGHT - bar.height}
          width={BAR_WIDTH}
          height={bar.height}
          fill="var(--clay)"
          opacity={bar.opacity}
          className="motion-safe:animate-[wave_2.4s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.12}s`, transformOrigin: "bottom" }}
        />
      ))}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.55); }
        }
      `}</style>
    </svg>
  );
}
