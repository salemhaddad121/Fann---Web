export interface ConversationSummary {
  id: string;
  artist_id: string;
  planner_id: string;
  last_message_at: string | null;
  created_at: string;
  other_display_name: string | null;
  other_thumbnail_url: string | null;
  last_message_body: string | null;
  last_message_sender_id: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
  sender_display_name: string | null;
  sender_thumbnail_url: string | null;
}

export interface MessagesResponse {
  data: Message[]; // newest first from the API — reverse for chat display
  meta: { total: number; page: number; limit: number; pages: number };
}
