import { apiFetch } from "@/lib/api";
import type {
  ArtistDetail,
  ArtistSearchResponse,
  AvailabilityBlock,
  CategoryGroup,
  SearchArtistsParams,
} from "@/types/artists";

export interface UpdateArtistProfilePayload {
  displayName?: string;
  bio?: string;
  categoryIds?: string[];
  locationCity?: string;
  locationCountry?: string;
  basePriceUsd?: number;
  languages?: string[];
  socialLinks?: Record<string, string>;
}

export async function searchArtists(params: SearchArtistsParams): Promise<ArtistSearchResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.categories?.length) qs.set("categories", params.categories.join(","));
  if (params.city) qs.set("city", params.city);
  if (params.minPrice !== undefined) qs.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) qs.set("maxPrice", String(params.maxPrice));
  if (params.verifiedOnly) qs.set("verifiedOnly", "true");
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  qs.set("limit", "20");

  // Public endpoint — no token needed, works for logged-out visitors too.
  return apiFetch<ArtistSearchResponse>(`/artists?${qs.toString()}`, { auth: false });
}

export async function getArtist(id: string): Promise<ArtistDetail> {
  return apiFetch<ArtistDetail>(`/artists/${id}`, { auth: false });
}

export async function getCategories(): Promise<CategoryGroup[]> {
  return apiFetch<CategoryGroup[]>("/categories", { auth: false });
}

// ----------------------------------------------------------------
// Own profile (requires login)
// ----------------------------------------------------------------
export async function getMyArtistProfile(): Promise<ArtistDetail> {
  return apiFetch<ArtistDetail>("/artists/me");
}

export async function updateMyArtistProfile(payload: UpdateArtistProfilePayload): Promise<ArtistDetail> {
  return apiFetch<ArtistDetail>("/artists/me", { method: "PUT", body: payload });
}

// Public — takes the artist's users.id, same id used by the reviews endpoint.
// GET /artists/:id (profile-id keyed) already embeds this for the public
// detail page; this standalone call is for the "my own profile" case where
// GET /artists/me doesn't include it.
export async function getArtistAvailability(artistUserId: string): Promise<AvailabilityBlock[]> {
  return apiFetch<AvailabilityBlock[]>(`/artists/${artistUserId}/availability`, { auth: false });
}

export interface CreateAvailabilityBlockPayload {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  note?: string;
}

export async function createAvailabilityBlock(
  payload: CreateAvailabilityBlockPayload,
): Promise<AvailabilityBlock> {
  return apiFetch<AvailabilityBlock>("/artists/me/availability", { method: "POST", body: payload });
}

export async function deleteAvailabilityBlock(blockId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/artists/me/availability/${blockId}`, { method: "DELETE" });
}
