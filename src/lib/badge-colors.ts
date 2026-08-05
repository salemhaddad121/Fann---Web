const BADGE_COLORS = [
  "bg-[#f7ede0] text-[#8a3b2a]",
  "bg-[#dfeceb] text-[#0a5555]",
  "bg-[#FEF3C7] text-[#92400E]",
  "bg-[#FCE7F3] text-[#831843]",
  "bg-[#f0e5d5] text-[#6b4a30]",
  "bg-[#D1FAE5] text-[#065F46]",
];

export function badgeColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash + label.charCodeAt(i)) % BADGE_COLORS.length;
  return BADGE_COLORS[hash];
}
