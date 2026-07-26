"use client";

import { useEffect, useRef } from "react";
import Uppy, { type UppyFile } from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import ImageEditor from "@uppy/image-editor";
import AwsS3 from "@uppy/aws-s3";
import type { Meta, Body } from "@uppy/utils";
import {
  ACCEPTED_MIME_TYPES,
  MAX_PHOTO_BYTES,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
  mediaTypeFromMime,
  probeVideo,
  probeImage,
  checkResolution,
  presignMedia,
  confirmMedia,
} from "@/lib/media-api";
import type { MediaItem } from "@/types/artists";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import "@uppy/image-editor/css/style.min.css";

// Uppy carries arbitrary metadata per file, typed as Record<string, unknown>.
// The probe step writes durationSec and the S3 step writes s3Key, so the two
// ends of the flow communicate through it — these read them back with the
// narrowing the library's own types can't express.
const readDuration = (file: UppyFile<Meta, Body>): number | undefined => {
  const v = file.meta.durationSec;
  return typeof v === "number" ? v : undefined;
};

const readS3Key = (file: UppyFile<Meta, Body>): string | undefined => {
  const v = file.meta.s3Key;
  return typeof v === "string" ? v : undefined;
};

export function UppyMediaUploader({
  remainingSlots,
  onUploaded,
  onClose,
}: {
  remainingSlots: number;
  onUploaded: (items: MediaItem[]) => void;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Held in refs so the Uppy instance — built once, in an effect that must
  // not re-run — always reads current values rather than closing over the
  // first render's props. Updated in an effect rather than during render,
  // which React 19 forbids.
  const onUploadedRef = useRef(onUploaded);
  const remainingRef = useRef(remainingSlots);

  useEffect(() => {
    onUploadedRef.current = onUploaded;
    remainingRef.current = remainingSlots;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const uppy = new Uppy({
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: remainingRef.current,
        // Uppy takes a single byte cap, so this is the larger of the two and
        // the per-type limit is enforced in the probe step below.
        maxFileSize: MAX_VIDEO_BYTES,
        allowedFileTypes: ACCEPTED_MIME_TYPES.split(","),
      },
    });

    uppy.use(Dashboard, {
      target: el,
      inline: true,
      height: 420,
      proudlyDisplayPoweredByUppy: false,
      note: `Images up to 10MB, video up to 250MB and ${MAX_VIDEO_SECONDS}s. Crop and rotate before uploading.`,
    });

    // Cropping/rotating is the reason for Uppy here — it edits the file in
    // place, so what gets probed and uploaded is the edited version.
    //
    // `target: Dashboard` is Uppy's own documented usage, but its
    // PluginTarget type doesn't accept a plugin constructor, so the cast is
    // working around the library's typing rather than the runtime contract.
    uppy.use(ImageEditor, { target: Dashboard as unknown as HTMLElement });

    // Validate as soon as a file is picked rather than at upload time.
    //
    // It cannot go in onBeforeFileAdded — that is synchronous and probing
    // means awaiting a metadata load. It deliberately does not go in a
    // preprocessor either: throwing from one fails the whole batch and Uppy
    // surfaces it as a bare "Upload failed" with no message attached to any
    // file, which is what this did first. Rejecting here instead lets the
    // offending file be removed with a specific reason, before the user ever
    // presses upload.
    uppy.on("file-added", async (file) => {
      const reject = (message: string) => {
        uppy.removeFile(file.id);
        uppy.info(message, "error", 6000);
      };

      const blob = file.data as File;
      const mediaType = mediaTypeFromMime(file.type ?? "");
      if (!mediaType) return reject(`${file.name}: unsupported file type.`);

      try {
        if (mediaType === "photo") {
          if (blob.size > MAX_PHOTO_BYTES) {
            return reject(`${file.name}: images must be 10MB or smaller.`);
          }
          const dims = await probeImage(blob);
          const bad = checkResolution("photo", dims.width, dims.height);
          if (bad) return reject(`${file.name}: ${bad}`);
        } else {
          const probe = await probeVideo(blob);
          if (probe.durationSec > MAX_VIDEO_SECONDS) {
            return reject(
              `${file.name}: videos must be ${MAX_VIDEO_SECONDS} seconds or shorter (this one is ${probe.durationSec}s).`,
            );
          }
          const bad = checkResolution("video", probe.width, probe.height);
          if (bad) return reject(`${file.name}: ${bad}`);
          // The presign call requires duration up front for videos.
          uppy.setFileMeta(file.id, { durationSec: probe.durationSec });
        }
      } catch {
        reject(`${file.name}: couldn't read that file. Try a different one.`);
      }
    });

    uppy.use(AwsS3, {
      // One PUT per file to a presigned URL — the same flow the hand-rolled
      // uploader used. Multipart would need extra backend endpoints that do
      // not exist.
      shouldUseMultipart: false,
      getUploadParameters: async (file: UppyFile<Meta, Body>) => {
        const mediaType = mediaTypeFromMime(file.type ?? "");
        if (!mediaType) throw new Error("Unsupported file type.");

        const { presignedUrl, s3Key } = await presignMedia({
          mediaType,
          filename: file.name ?? "upload",
          fileSizeBytes: file.size ?? 0,
          durationSec: readDuration(file),
        });

        // Stashed so the confirm step can find it once the PUT succeeds.
        uppy.setFileMeta(file.id, { s3Key });

        return {
          method: "PUT" as const,
          url: presignedUrl,
          headers: { "Content-Type": file.type ?? "application/octet-stream" },
        };
      },
    });

    // The PUT only puts bytes in the bucket. The row is created by our own
    // confirm endpoint, so that runs per file once Uppy reports success.
    uppy.on("complete", async (result) => {
      const created: MediaItem[] = [];
      for (const file of result.successful ?? []) {
        const mediaType = mediaTypeFromMime(file.type ?? "");
        const s3Key = readS3Key(file);
        if (!mediaType || !s3Key) continue;
        try {
          created.push(
            await confirmMedia({
              s3Key,
              mediaType,
              fileSizeBytes: file.size ?? 0,
              durationSec: readDuration(file),
            }),
          );
        } catch {
          uppy.info(`Uploaded ${file.name} but couldn't save it. Please try again.`, "error", 5000);
        }
      }
      if (created.length) {
        onUploadedRef.current(created);
        uppy.clear();
      }
    });

    return () => uppy.destroy();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40">
      <div className="w-full max-w-2xl bg-white rounded-[14px] border border-hairline overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
          <span className="text-sm font-semibold text-ink">Add photos &amp; videos</span>
          <button onClick={onClose} aria-label="Close" className="text-muted">
            <i className="ti ti-x text-lg" />
          </button>
        </div>
        <div ref={containerRef} />
      </div>
    </div>
  );
}
