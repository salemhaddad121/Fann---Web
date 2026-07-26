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

// Resolution limits are expressed as short side / long side rather than
// width / height on purpose: artists shoot on phones, so portrait clips are
// as common as landscape and a raw width check would reject them wrongly.
//
// The floors exist for quality — a blurry 240p showreel makes the whole
// directory look bad. The ceilings exist so a phone's 4K/8K output doesn't
// sail through the byte cap only to be unusable in a 165px card.
export const MIN_VIDEO_SHORT_SIDE = 480; // 854x480 landscape or 480x854 portrait
export const MAX_VIDEO_LONG_SIDE = 3840; // 4K
export const MIN_PHOTO_SHORT_SIDE = 600;
export const MAX_PHOTO_LONG_SIDE = 8000;

export function mediaTypeFromMime(mime: string): MediaType | null {
  if (!(mime in MIME_TO_EXT)) return null;
  return mime.startsWith("video/") ? "video" : "photo";
}

export interface VideoProbe {
  durationSec: number;
  width: number;
  height: number;
}

// IMPORTANT: everything below runs in the browser, so it is a usability
// guard, not enforcement. It catches honest mistakes immediately and
// without an upload, but a crafted request can still bypass it — the
// backend takes durationSec on trust and never sees the file. Treat these
// limits as UX, and do not rely on them for anything security-sensitive.
//
// One metadata load yields duration and dimensions together, so this
// replaces the old duration-only helper rather than probing twice.
export function probeVideo(file: File): Promise<VideoProbe> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        durationSec: Math.ceil(video.duration),
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Couldn't read that video file."));
    };
    video.src = URL.createObjectURL(file);
  });
}

export function probeImage(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Couldn't read that image file."));
    };
    img.src = URL.createObjectURL(file);
  });
}

// Returns null when the dimensions are acceptable, or a ready-to-show
// message explaining which limit was missed. Kept out of the component so
// the rules are testable without rendering anything.
export function checkResolution(
  mediaType: MediaType,
  width: number,
  height: number,
): string | null {
  if (!width || !height) {
    return "Couldn't read that file's dimensions. Try a different file.";
  }

  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  const actual = `${width}x${height}`;

  if (mediaType === "video") {
    if (shortSide < MIN_VIDEO_SHORT_SIDE) {
      return `Videos need to be at least ${MIN_VIDEO_SHORT_SIDE}p on the shortest side (this one is ${actual}).`;
    }
    if (longSide > MAX_VIDEO_LONG_SIDE) {
      return `Videos can be at most ${MAX_VIDEO_LONG_SIDE}px on the longest side (this one is ${actual}).`;
    }
    return null;
  }

  if (shortSide < MIN_PHOTO_SHORT_SIDE) {
    return `Photos need to be at least ${MIN_PHOTO_SHORT_SIDE}px on the shortest side (this one is ${actual}).`;
  }
  if (longSide > MAX_PHOTO_LONG_SIDE) {
    return `Photos can be at most ${MAX_PHOTO_LONG_SIDE}px on the longest side (this one is ${actual}).`;
  }
  return null;
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

export class MediaUploadError extends Error {
  // true: fetch() itself threw — the browser blocked the request before it
  // ever reached S3, almost always because the bucket's CORS policy
  // doesn't allow this origin/method yet (occasionally a genuine network
  // drop, which looks identical from JS's perspective — browsers don't
  // expose the real reason for a failed cross-origin request).
  // false: fetch() resolved with a non-2xx status — CORS was fine (the
  // browser let the response through), S3 itself rejected the upload for
  // an unrelated reason (e.g. an expired presigned URL).
  likelyCorsIssue: boolean;
  constructor(message: string, likelyCorsIssue: boolean) {
    super(message);
    this.likelyCorsIssue = likelyCorsIssue;
  }
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

  let putResponse: Response;
  try {
    putResponse = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
  } catch {
    throw new MediaUploadError(
      "Couldn't reach storage to upload this file. This usually means the S3 bucket's CORS settings need to be updated — see docs/s3-cors-setup.md in the backend repo.",
      true,
    );
  }
  if (!putResponse.ok) {
    throw new MediaUploadError("The upload to storage failed. Please try again.", false);
  }

  return confirmMedia({
    s3Key,
    mediaType,
    fileSizeBytes: file.size,
    durationSec,
  });
}
