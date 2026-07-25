import { apiFetch } from "@/lib/api";
import type { PlannerDetail, PlannerSearchResponse, SearchPlannersParams } from "@/types/planners";

export interface UpdatePlannerProfilePayload {
  displayName?: string;
  companyName?: string;
  bio?: string;
  locationCity?: string;
  locationCountry?: string;
  eventTypes?: string[];
  bookerType?: string;
  socialLinks?: Record<string, string>;
}

export async function searchPlanners(params: SearchPlannersParams): Promise<PlannerSearchResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.eventTypes?.length) qs.set("eventTypes", params.eventTypes.join(","));
  if (params.city) qs.set("city", params.city);
  if (params.country) qs.set("country", params.country);
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  qs.set("limit", "20");

  // Public endpoint — no token needed, works for logged-out visitors too.
  return apiFetch<PlannerSearchResponse>(`/planners?${qs.toString()}`, { auth: false });
}

export async function getPlanner(id: string): Promise<PlannerDetail> {
  return apiFetch<PlannerDetail>(`/planners/${id}`, { auth: false });
}

// Distinct event types actually in use by active planners — powers the
// search chip row (previously a static hardcoded list, since event_types
// has no reference table the way artist categories do).
export async function getEventTypes(): Promise<string[]> {
  return apiFetch<string[]>("/planners/event-types", { auth: false });
}

// ----------------------------------------------------------------
// Own profile (requires login)
// ----------------------------------------------------------------
export async function getMyPlannerProfile(): Promise<PlannerDetail> {
  return apiFetch<PlannerDetail>("/planners/me");
}

export async function updateMyPlannerProfile(payload: UpdatePlannerProfilePayload): Promise<PlannerDetail> {
  return apiFetch<PlannerDetail>("/planners/me", { method: "PUT", body: payload });
}
