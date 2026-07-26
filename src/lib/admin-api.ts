import { apiFetch } from "@/lib/api";
import type {
  AdminUserRow,
  AdminUserDetail,
  AdminIdDocument,
  AdminPayment,
  AdminFlag,
  AuditLogEntry,
  AdminCategoryGroup,
  AdminCategory,
  AdminReview,
  AdminStats,
  SignupTrendPoint,
  GeographyRow,
  BookedCategoryRow,
  BookerTypeRow,
  UserStatus,
  PaginatedResponse,
} from "@/types/admin";

export async function getAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>("/admin/stats");
}

// ---------------- Analytics ----------------
// Both derived entirely from existing columns (signup timestamps,
// profile city fields) — no page-view/conversion data exists to query,
// so those aren't offered here. See admin.service.ts's comment.
export async function getSignupTrend(days = 30): Promise<SignupTrendPoint[]> {
  return apiFetch<SignupTrendPoint[]>(`/admin/analytics/signups?days=${days}`);
}

export async function getGeographyBreakdown(): Promise<GeographyRow[]> {
  return apiFetch<GeographyRow[]>("/admin/analytics/geography");
}

export async function getTopBookedCategories(): Promise<BookedCategoryRow[]> {
  return apiFetch<BookedCategoryRow[]>("/admin/analytics/booked-categories");
}

export async function getTopBookerTypes(): Promise<BookerTypeRow[]> {
  return apiFetch<BookerTypeRow[]>("/admin/analytics/booker-types");
}

// ---------------- Users ----------------
export async function listAdminUsers(params: {
  role?: string;
  status?: string;
  q?: string;
  page?: number;
} = {}): Promise<PaginatedResponse<AdminUserRow>> {
  const qs = new URLSearchParams();
  if (params.role) qs.set("role", params.role);
  if (params.status) qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", String(params.page));
  qs.set("limit", "30");
  return apiFetch<PaginatedResponse<AdminUserRow>>(`/admin/users?${qs.toString()}`);
}

export async function getAdminUser(id: string): Promise<AdminUserDetail> {
  return apiFetch<AdminUserDetail>(`/admin/users/${id}`);
}

export async function updateAdminUserStatus(
  id: string,
  status: UserStatus,
  note?: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: { status, note },
  });
}

// Returns a one-time temporary password. It is not stored in plaintext
// anywhere, so this is the only chance to read it — the UI shows it once and
// the admin has to reset again if it's lost.
export async function resetAdminUserPassword(
  id: string,
  note?: string,
): Promise<{ temporaryPassword: string }> {
  return apiFetch<{ temporaryPassword: string }>(`/admin/users/${id}/reset-password`, {
    method: "POST",
    body: { note },
  });
}

// ---------------- ID documents ----------------
export async function listPendingDocuments(page = 1): Promise<PaginatedResponse<AdminIdDocument>> {
  return apiFetch<PaginatedResponse<AdminIdDocument>>(`/admin/id-documents?page=${page}&limit=30`);
}

export async function reviewIdDocument(
  id: string,
  decision: "approved" | "rejected",
  rejectionReason?: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/id-documents/${id}`, {
    method: "PATCH",
    body: { decision, rejectionReason },
  });
}

// ---------------- Payments ----------------
export async function listPendingPayments(page = 1): Promise<PaginatedResponse<AdminPayment>> {
  return apiFetch<PaginatedResponse<AdminPayment>>(`/admin/payments?page=${page}&limit=30`);
}

export async function reviewPayment(
  id: string,
  decision: "confirmed" | "rejected",
  rejectionReason?: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/payments/${id}`, {
    method: "PATCH",
    body: { decision, rejectionReason },
  });
}

// ---------------- Flags ----------------
export async function listOpenFlags(page = 1): Promise<PaginatedResponse<AdminFlag>> {
  return apiFetch<PaginatedResponse<AdminFlag>>(`/admin/flags?page=${page}&limit=30`);
}

export async function resolveFlag(
  id: string,
  decision: "dismissed" | "actioned",
  resolverNote?: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/flags/${id}`, {
    method: "PATCH",
    body: { decision, resolverNote },
  });
}

// ---------------- Audit log ----------------
export async function getAuditLog(page = 1): Promise<PaginatedResponse<AuditLogEntry>> {
  return apiFetch<PaginatedResponse<AuditLogEntry>>(`/admin/audit-log?page=${page}&limit=30`);
}

// ---------------- Category groups ----------------
export async function listAdminCategoryGroups(): Promise<AdminCategoryGroup[]> {
  return apiFetch<AdminCategoryGroup[]>("/admin/category-groups");
}

export async function createCategoryGroup(payload: {
  name: string;
  icon?: string;
}): Promise<AdminCategoryGroup> {
  return apiFetch<AdminCategoryGroup>("/admin/category-groups", { method: "POST", body: payload });
}

export async function updateCategoryGroup(
  id: string,
  payload: { name?: string; icon?: string },
): Promise<AdminCategoryGroup> {
  return apiFetch<AdminCategoryGroup>(`/admin/category-groups/${id}`, { method: "PATCH", body: payload });
}

export async function deleteCategoryGroup(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/category-groups/${id}`, { method: "DELETE" });
}

// ---------------- Categories ----------------
export async function listAdminCategories(): Promise<AdminCategory[]> {
  return apiFetch<AdminCategory[]>("/admin/categories");
}

export async function createCategory(payload: {
  name: string;
  groupId: string;
}): Promise<AdminCategory> {
  return apiFetch<AdminCategory>("/admin/categories", { method: "POST", body: payload });
}

export async function updateCategory(
  id: string,
  payload: { name?: string; groupId?: string },
): Promise<AdminCategory> {
  return apiFetch<AdminCategory>(`/admin/categories/${id}`, { method: "PATCH", body: payload });
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/categories/${id}`, { method: "DELETE" });
}

// ---------------- Reviews (moderation) ----------------
export async function listAdminReviews(page = 1): Promise<PaginatedResponse<AdminReview>> {
  return apiFetch<PaginatedResponse<AdminReview>>(`/admin/reviews?page=${page}&limit=30`);
}

export async function removeAdminReview(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/reviews/${id}`, { method: "DELETE" });
}
