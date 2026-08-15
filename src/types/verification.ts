export type IdDocumentKind = "id_document" | "selfie";

/** "missing" is synthesised by the API for a document never uploaded. */
export type IdDocumentStatus = "missing" | "pending" | "approved" | "rejected";

export interface VerificationDocument {
  kind: IdDocumentKind;
  status: IdDocumentStatus;
  rejection_reason: string | null;
  uploaded_at: string | null;
  reviewed_at: string | null;
}

export interface MyVerification {
  /** One entry per required kind, uploaded or not — a full checklist. */
  documents: VerificationDocument[];
  complete: boolean;
  /** Phrased for a person: "Upload your selfie", not a status code. */
  outstanding: string[];
}

export const KIND_LABELS: Record<IdDocumentKind, string> = {
  id_document: "ID document",
  selfie: "Selfie",
};

export const KIND_HINTS: Record<IdDocumentKind, string> = {
  id_document:
    "A passport or national ID. Make sure the whole document is in frame and the text is readable.",
  selfie:
    "A clear photo of your face, taken now — not a picture of a picture. We use it to check the ID belongs to you.",
};
