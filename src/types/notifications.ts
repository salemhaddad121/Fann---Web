export type NotificationType =
  | "booking_request"
  | "booking_accepted"
  | "booking_declined"
  | "booking_cancelled"
  | "review_request"
  | "new_message"
  | "account_approved"
  | "account_suspended"
  | "account_banned"
  | "id_verified"
  | "id_rejected"
  | "payment_confirmed"
  | "payment_rejected";

export interface NotificationData {
  booking_id?: string;
  event_name?: string;
  event_date?: string;
  planner_name?: string;
  conversation_id?: string;
  sender_name?: string;
  note?: string;
  rejection_reason?: string;
  payment_id?: string;
}

export interface NotificationRow {
  id: string;
  type: NotificationType | string; // string fallback in case new types appear server-side
  title: string;
  body: string | null;
  data: NotificationData | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  data: NotificationRow[];
  meta: { total: number; page: number; limit: number; pages: number };
}
