import { apiFetch } from "@/lib/api";
import type { ArtistCard } from "@/types/artists";

export async function listSavedArtists(): Promise<ArtistCard[]> {
  return apiFetch<ArtistCard[]>("/saved-artists");
}

export async function listSavedArtistIds(): Promise<string[]> {
  return apiFetch<string[]>("/saved-artists/ids");
}

export async function saveArtist(artistProfileId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/saved-artists/${artistProfileId}`, { method: "POST" });
}

export async function unsaveArtist(artistProfileId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/saved-artists/${artistProfileId}`, { method: "DELETE" });
}
