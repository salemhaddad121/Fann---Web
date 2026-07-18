import type { BookingStatus } from "@/types/bookings";

const STYLES: Record<BookingStatus, string> = {
  pending: "bg-[#FEF3C7] text-[#92400E]",
  accepted: "bg-[#DCFCE7] text-[#166534]",
  completed: "bg-mist text-indigo",
  declined: "bg-[#FEF2F2] text-[#7F1D1D]",
  cancelled: "bg-[#F1F5F9] text-[#334155]",
};

const LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
