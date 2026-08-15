import { apiFetch } from "@/lib/api";
import type {
  SupportTicket,
  SupportTicketDetail,
  SupportTicketStatus,
} from "@/types/support";

export interface CreateSupportTicketPayload {
  subject: string;
  body: string;
  /** Required when signed out; ignored by the server when signed in. */
  guestEmail?: string;
  guestName?: string;
  /** Normalised route, never a real URL — matches the API's validation. */
  sourcePath?: string;
}

// Open to guests: the people most likely to need help are the ones who
// cannot get in, so `auth: false` stops a 401 here triggering a pointless
// token refresh for someone with no session.
export async function createSupportTicket(
  payload: CreateSupportTicketPayload,
): Promise<{ id: string; subject: string; status: string; message: string }> {
  return apiFetch("/support/tickets", { method: "POST", body: payload, auth: false });
}

export async function listMySupportTickets(): Promise<SupportTicketDetail[]> {
  return apiFetch<SupportTicketDetail[]>("/support/tickets/me");
}

// ── Admin ──

export async function listSupportTickets(
  page = 1,
  status?: SupportTicketStatus,
): Promise<{ data: SupportTicket[]; meta: { pages: number; total: number } }> {
  const qs = new URLSearchParams({ page: String(page), limit: "30" });
  if (status) qs.set("status", status);
  return apiFetch(`/admin/support?${qs.toString()}`);
}

export async function getSupportTicket(id: string): Promise<SupportTicketDetail> {
  return apiFetch<SupportTicketDetail>(`/admin/support/${id}`);
}

export async function updateSupportTicket(
  id: string,
  patch: { status?: SupportTicketStatus; reply?: string },
): Promise<SupportTicketDetail> {
  return apiFetch<SupportTicketDetail>(`/admin/support/${id}`, {
    method: "PATCH",
    body: patch,
  });
}
