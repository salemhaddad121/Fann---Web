import type { MediaItem } from "@/types/artists";

export interface PlannerCard {
  id: string;
  user_id: string;
  display_name: string;
  company_name: string | null;
  bio: string | null;
  location_city: string | null;
  location_country: string | null;
  event_types: string[];
  booker_type: string | null;
  social_links: Record<string, string> | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface PlannerSearchMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PlannerSearchResponse {
  data: PlannerCard[];
  meta: PlannerSearchMeta;
}

export interface PlannerDetail extends PlannerCard {
  avg_rating: string | number | null;
  review_count: number;
  media: MediaItem[];
}

export interface SearchPlannersParams {
  q?: string;
  eventTypes?: string[];
  city?: string;
  country?: string;
  sort?: "newest" | "name_asc";
  page?: number;
}

// The fixed booker types (mirrors the backend `booker_type` enum). One per booker.
export const BOOKER_TYPES = [
  "Event Planner",
  "Venue",
  "Restaurant",
  "Bar",
  "Wedding Planner",
  "University",
  "Other",
];
