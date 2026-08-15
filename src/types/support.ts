export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicketMessage {
  id: string;
  is_staff: boolean;
  body: string;
  created_at: string;
  author_email?: string | null;
}

export interface SupportTicket {
  id: string;
  subject: string;
  body: string;
  status: SupportTicketStatus;
  source_path: string | null;
  created_at: string;
  resolved_at: string | null;
  // Exactly one of these identifies the requester: a signed-in user has
  // user_email, a guest has guest_email. The database CHECK guarantees at
  // least one is present.
  guest_email?: string | null;
  guest_name?: string | null;
  user_email?: string | null;
  user_role?: string | null;
  assigned_email?: string | null;
}

export interface SupportTicketDetail extends SupportTicket {
  messages: SupportTicketMessage[];
}

export const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};
