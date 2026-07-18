import type { NotificationType } from "@/types/notifications";

const STYLES: Record<NotificationType, { icon: string; bg: string; fg: string }> = {
  booking_request: { icon: "ti-calendar-plus", bg: "bg-[#FEF3C7]", fg: "text-[#92400E]" },
  booking_accepted: { icon: "ti-calendar-check", bg: "bg-[#DCFCE7]", fg: "text-[#166534]" },
  booking_declined: { icon: "ti-calendar-x", bg: "bg-[#FEF2F2]", fg: "text-[#7F1D1D]" },
  booking_cancelled: { icon: "ti-calendar-off", bg: "bg-[#F1F5F9]", fg: "text-[#334155]" },
  review_request: { icon: "ti-star", bg: "bg-mist", fg: "text-indigo" },
  new_message: { icon: "ti-message-circle", bg: "bg-[#E0F2FE]", fg: "text-[#075985]" },
  account_approved: { icon: "ti-rosette-discount-check", bg: "bg-[#DCFCE7]", fg: "text-[#166534]" },
  account_suspended: { icon: "ti-alert-triangle", bg: "bg-[#FEF3C7]", fg: "text-[#92400E]" },
  account_banned: { icon: "ti-ban", bg: "bg-[#FEF2F2]", fg: "text-[#7F1D1D]" },
  id_verified: { icon: "ti-rosette-discount-check", bg: "bg-[#DCFCE7]", fg: "text-[#166534]" },
  id_rejected: { icon: "ti-id-badge-2", bg: "bg-[#FEF2F2]", fg: "text-[#7F1D1D]" },
  payment_confirmed: { icon: "ti-cash", bg: "bg-[#DCFCE7]", fg: "text-[#166534]" },
  payment_rejected: { icon: "ti-cash-off", bg: "bg-[#FEF2F2]", fg: "text-[#7F1D1D]" },
};

const FALLBACK = { icon: "ti-bell", bg: "bg-mist", fg: "text-muted" };

export function notificationStyle(type: string) {
  return STYLES[type as NotificationType] ?? FALLBACK;
}
