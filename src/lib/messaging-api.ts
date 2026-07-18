import { apiFetch } from "@/lib/api";
import type { ConversationSummary, Message, MessagesResponse } from "@/types/messaging";

export interface Conversation {
  id: string;
  artist_id: string;
  planner_id: string;
  created_at: string;
}

// Planners only — the backend throws a 403 for anyone else. Returns the
// existing thread if one's already started with this artist.
export async function startConversation(artistUserId: string): Promise<Conversation> {
  return apiFetch<Conversation>("/conversations", {
    method: "POST",
    body: { artistId: artistUserId },
  });
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  return apiFetch<Conversation>(`/conversations/${conversationId}`);
}

export async function listConversations(): Promise<ConversationSummary[]> {
  return apiFetch<ConversationSummary[]>("/conversations");
}

export async function getMessages(conversationId: string): Promise<MessagesResponse> {
  return apiFetch<MessagesResponse>(`/conversations/${conversationId}/messages?limit=100`);
}

export async function sendMessage(conversationId: string, body: string): Promise<Message> {
  return apiFetch<Message>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: { body },
  });
}

export async function markRead(conversationId: string): Promise<{ markedRead: number }> {
  return apiFetch<{ markedRead: number }>(`/conversations/${conversationId}/read`, { method: "PUT" });
}
