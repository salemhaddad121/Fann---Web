import { apiFetch } from "@/lib/api";
import type { Review } from "@/types/reviews";

// IMPORTANT: unlike GET /artists/:id and GET /planners/:id (which take the
// artist_profiles.id / planner_profiles.id), these two take the person's
// users.id — reviews.reviewee_id references users(id), not the profile
// table. Always pass artist.user_id / planner.user_id here, not .id.

export async function getArtistReviews(artistUserId: string): Promise<Review[]> {
  return apiFetch<Review[]>(`/artists/${artistUserId}/reviews`, { auth: false });
}

export async function getPlannerReviews(plannerUserId: string): Promise<Review[]> {
  return apiFetch<Review[]>(`/planners/${plannerUserId}/reviews`, { auth: false });
}

export interface SubmitReviewPayload {
  bookingId: string;
  overallScore: number;
  scoreCommunication: number;
  scoreProfessionalism: number;
  scorePunctuality: number;
  scoreQuality: number;
  body?: string;
}

// Reviews stay hidden (is_visible=false) until the other party also reviews,
// or 7 days pass — the mutual-blind mechanic. The API returns a message
// saying as much; there's no "have I already reviewed this booking?" check
// endpoint, so the UI can only find out by trying (see the 400 handling in
// the booking detail page).
export async function submitReview(payload: SubmitReviewPayload): Promise<Review & { message: string }> {
  return apiFetch<Review & { message: string }>("/reviews", { method: "POST", body: payload });
}
