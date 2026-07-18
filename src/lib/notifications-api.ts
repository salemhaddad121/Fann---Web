import { apiFetch } from "@/lib/api";
import type { NotificationsResponse } from "@/types/notifications";

export async function listNotifications(params: { page?: number; unreadOnly?: boolean } = {}): Promise<NotificationsResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.unreadOnly) qs.set("unreadOnly", "true");
  qs.set("limit", "20");
  return apiFetch<NotificationsResponse>(`/notifications?${qs.toString()}`);
}

export async function markNotificationRead(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/notifications/read-all", { method: "PATCH" });
}
