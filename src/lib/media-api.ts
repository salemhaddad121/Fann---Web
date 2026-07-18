import { apiFetch } from "@/lib/api";
import type { MediaItem } from "@/types/artists";

export type MediaType = "photo" | "video";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
};

export const ACCEPTED_MIME_TYPES = Object.keys(MIME_TO_EXT).join(",");
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 250 * 1024 * 1024; // 250 MB
export const MAX_VIDEO_SECONDS = 60;

export function mediaTypeFromMime(mime: string): MediaType | null {
  if (!(mime in MIME_TO_EXT)) return null;
  return mime.startsWith("video/") ? "video" : "photo";
}

// Reads a video file's duration in the browser, without any upload —
// needed because the backend requires durationSec up front (both at
// presign time and again at confirm time) and validates it against a
// 60-second cap.
export function getVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(Math.ceil(video.duration));
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Couldn't read that video file."));
    };
    video.src = URL.createObjectURL(file);
  });
}

interface PresignResponse {
  presignedUrl: string;
  s3Key: string;
}

async function presignMedia(payload: {
  mediaType: MediaType;
  filename: string;
  fileSizeBytes: number;
  durationSec?: number;
}): Promise<PresignResponse> {
  return apiFetch<PresignResponse>("/media/presign", { method: "POST", body: payload });
}

async function confirmMedia(payload: {
  s3Key: string;
  mediaType: MediaType;
  fileSizeBytes: number;
  durationSec?: number;
}): Promise<MediaItem> {
  return apiFetch<MediaItem>("/media/confirm", { method: "POST", body: payload });
}

export async function setPrimaryMedia(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/media/${id}/primary`, { method: "PUT" });
}

export async function deleteMedia(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/media/${id}`, { method: "DELETE" });
}

// Full flow: presign -> PUT the raw bytes straight to S3 -> confirm.
// The presigned URL points at S3 directly, not our API — this fetch call
// never goes through apiFetch (no auth header, no /api/v1 prefix).
export async function uploadMedia(
  file: File,
  mediaType: MediaType,
  durationSec?: number,
): Promise<MediaItem> {
  const { presignedUrl, s3Key } = await presignMedia({
    mediaType,
    filename: file.name,
    fileSizeBytes: file.size,
    durationSec,
  });

  const putResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putResponse.ok) {
    throw new Error("The upload to storage failed. Please try again.");
  }

  return confirmMedia({
    s3Key,
    mediaType,
    fileSizeBytes: file.size,
    durationSec,
  });
}
