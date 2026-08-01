import { apiFetch } from "@/lib/api";
import type { ConversationSummary, Message, MessagesResponse } from "@/types/messaging";

export interface Conversation {
  id: string;
  artist_id: string;
  planner_id: string;
  created_at: string;
  status: "pending" | "accepted" | "declined";
  initiated_by: string | null;
}

// Planners only. Returns the existing thread if one's already started
// with this artist. Comes back accepted — a planner reaching out to an
// artist needs no approval.
export async function startConversation(artistUserId: string): Promise<Conversation> {
  return apiFetch<Conversation>("/conversations", {
    method: "POST",
    body: { artistId: artistUserId },
  });
}

// Artists only. Comes back as a *pending* request: the planner has to
// accept before they can reply. Throws if they previously declined.
export async function requestConversation(plannerUserId: string): Promise<Conversation> {
  return apiFetch<Conversation>("/conversations", {
    method: "POST",
    body: { plannerId: plannerUserId },
  });
}

// Planners only — accept or decline an artist's message request.
export async function respondToRequest(
  conversationId: string,
  decision: "accepted" | "declined",
): Promise<Conversation> {
  return apiFetch<Conversation>(`/conversations/${conversationId}/respond`, {
    method: "PATCH",
    body: { decision },
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
