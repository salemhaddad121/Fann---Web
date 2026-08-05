import type { RegisterPayload } from "@/types/auth";

type Role = RegisterPayload["role"];

const OPTIONS: { value: Role; label: string; blurb: string }[] = [
  { value: "artist", label: "I'm an artist", blurb: "DJ, band, photographer, MC…" },
  { value: "planner", label: "I'm a planner", blurb: "Booking talent for an event" },
];

export function RoleToggle({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <div className="mb-4">
      <span className="block text-xs font-semibold text-ink mb-1.5">I am…</span>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
                active ? "border-[#e0a570] bg-sand" : "border-hairline bg-surface"
              }`}
              aria-pressed={active}
            >
              <span className={`block text-sm font-semibold ${active ? "text-clay" : "text-ink"}`}>
                {opt.label}
              </span>
              <span className="block text-xs text-faint mt-0.5">{opt.blurb}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
