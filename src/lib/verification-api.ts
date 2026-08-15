import { apiFetch } from "@/lib/api";
import type { IdDocumentKind, MyVerification } from "@/types/verification";

export async function getMyVerification(): Promise<MyVerification> {
  return apiFetch<MyVerification>("/verification/me");
}

interface PresignResponse {
  presignedUrl: string;
  s3Key: string;
}

/**
 * Uploads one identity document.
 *
 * Three steps, same shape as profile media: ask for a presigned PUT, send
 * the bytes straight to storage, then tell the API it landed. The file
 * never passes through the API, which is what keeps a passport scan off
 * our own request logs.
 */
export async function uploadIdentityDocument(
  kind: IdDocumentKind,
  file: File,
): Promise<void> {
  const { presignedUrl, s3Key } = await apiFetch<PresignResponse>(
    "/verification/documents/presign",
    {
      method: "POST",
      body: { kind, filename: file.name, fileSizeBytes: file.size },
    },
  );

  // Straight to S3/R2, not through apiFetch — this one carries no cookies
  // and must not have a JSON content type.
  const upload = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!upload.ok) {
    // The most common cause by far is bucket CORS, which no amount of
    // frontend code can fix — see docs/s3-cors-setup.md in the API repo.
    throw new Error(
      "The upload was blocked by storage. If this keeps happening, the bucket's CORS policy needs applying.",
    );
  }

  await apiFetch("/verification/documents/confirm", {
    method: "POST",
    body: { kind, s3Key },
  });
}

/** Admin: a short-lived link to view one document. Expires in 5 minutes. */
export async function getDocumentViewUrl(documentId: string): Promise<string> {
  const { url } = await apiFetch<{ url: string }>(
    `/admin/id-documents/${documentId}/view`,
  );
  return url;
}
