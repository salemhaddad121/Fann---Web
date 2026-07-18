import { apiFetch } from "@/lib/api";

export interface PublicUserInfo {
  id: string;
  role: "artist" | "planner" | "admin";
  displayName: string | null;
  thumbnailUrl: string | null;
  profileId: string | null;
}

export async function getUserPublicInfo(userId: string): Promise<PublicUserInfo> {
  return apiFetch<PublicUserInfo>(`/users/${userId}/public-info`, { auth: false });
}
