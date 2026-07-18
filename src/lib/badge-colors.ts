const BADGE_COLORS = [
  "bg-[#EEF2FE] text-[#1E3A8A]",
  "bg-[#E0F2FE] text-[#075985]",
  "bg-[#FEF3C7] text-[#92400E]",
  "bg-[#FCE7F3] text-[#831843]",
  "bg-[#DBEAFE] text-[#1E40AF]",
  "bg-[#D1FAE5] text-[#065F46]",
];

export function badgeColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash + label.charCodeAt(i)) % BADGE_COLORS.length;
  return BADGE_COLORS[hash];
}
