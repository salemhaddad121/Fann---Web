export type BookingStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed";

export interface Booking {
  id: string;
  artist_id: string;
  planner_id: string;
  conversation_id: string | null;
  event_name: string;
  event_date: string; // "YYYY-MM-DD"
  event_location: string | null;
  duration_hours: string | number | null;
  agreed_fee_usd: string | number | null;
  notes: string | null;
  status: BookingStatus;
  artist_accepted_at: string | null;
  planner_accepted_at: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancellation_note: string | null;
  review_emails_sent_at: string | null;
  created_at: string;
}

export interface CreateBookingPayload {
  artistId: string;
  conversationId?: string;
  eventName: string;
  eventDate: string;
  eventLocation?: string;
  durationHours?: number;
  agreedFeeUsd?: number;
  notes?: string;
}
