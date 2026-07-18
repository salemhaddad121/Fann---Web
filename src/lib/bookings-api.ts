import { apiFetch } from "@/lib/api";
import type { Booking, CreateBookingPayload } from "@/types/bookings";

export async function listMyBookings(): Promise<Booking[]> {
  return apiFetch<Booking[]>("/bookings/me");
}

export async function getBooking(id: string): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${id}`);
}

// Planners only — the backend 403s anyone else.
export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  return apiFetch<Booking>("/bookings", { method: "POST", body: payload });
}

// Artists only.
export async function respondToBooking(
  id: string,
  decision: "accepted" | "declined",
  note?: string,
): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${id}/respond`, { method: "PATCH", body: { decision, note } });
}

// Either participant.
export async function cancelBooking(id: string, note?: string): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${id}/cancel`, { method: "PATCH", body: { note } });
}
