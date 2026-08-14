export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  categories: Category[];
}

/**
 * How much of this record the server decided to send.
 *
 * 'guest' and 'registered' receive identical data — an account alone
 * unlocks nothing — but they need different prompts, so the API reports
 * which one it was rather than making the client guess.
 */
export type ViewerTier = "guest" | "registered" | "subscribed";

export interface ArtistCard {
  id: string;
  user_id: string;
  /** Masked to "Karim N." unless viewer_tier is "subscribed". */
  display_name: string;
  bio: string | null;
  location_city: string | null;
  location_country: string | null;
  // The paywalled fields are OMITTED by the server below the paying tier,
  // not nulled — so these are optional, and their absence is the signal to
  // render a locked placeholder. Never assume they exist.
  base_price_usd?: string | number | null;
  social_links?: Record<string, string> | null;
  deposit_usd?: string | number | null;
  cancellation_policy?: string | null;
  /** Stands in for base_price_usd below the paying tier, e.g. "$250–$500". */
  base_price_band?: string | null;
  viewer_tier?: ViewerTier;
  is_masked?: boolean;
  languages: string[] | null;
  is_verified: boolean;
  thumbnail_url: string | null;
  created_at: string;
  categories: Category[];
}

export interface ArtistSearchMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ArtistSearchResponse {
  data: ArtistCard[];
  meta: ArtistSearchMeta;
}

export interface MediaItem {
  id: string;
  media_type: string;
  cdn_url: string;
  duration_sec: number | null;
  is_primary: boolean;
  sort_order: number;
}

export interface AvailabilityBlock {
  id: string;
  start_date: string;
  end_date: string;
  note: string | null;
}

export interface ArtistDetail extends ArtistCard {
  // avg_rating/review_count are still returned by the API and still
  // maintained by the reviews service, but nothing user-facing renders them
  // any more — the profile shows bookings_count instead.
  avg_rating: string | number | null;
  review_count: number;
  // Completed bookings only. Optional so an older API response still types.
  bookings_count?: number;
  // users.created_at — when the account was created, not when the profile
  // row was written (those differ). Optional so an older API response
  // still types.
  joined_at?: string;
  media: MediaItem[];
  availability: AvailabilityBlock[];
}

export interface SearchArtistsParams {
  q?: string;
  categories?: string[];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  sort?: "price_asc" | "price_desc" | "newest";
  page?: number;
}
