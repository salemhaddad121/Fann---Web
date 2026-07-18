const HEIGHTS = [18, 34, 52, 30, 64, 40, 58, 26, 46, 70, 38, 22, 50, 32, 60, 28, 44, 20];

export function Waveform({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 90"
      width="360"
      height="90"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {HEIGHTS.map((h, i) => (
        <rect
          key={i}
          x={i * 20}
          y={90 - h}
          width="8"
          height={h}
          rx="2"
          fill="#2B52E8"
          opacity={0.35 + (i % 4) * 0.15}
          className="motion-safe:animate-[wave_2.4s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.08}s`, transformOrigin: "bottom" }}
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
