// These mirror src/auth/dto/auth.dto.ts and the shapes returned by
// auth.service.ts in the fann-api backend. Keeping them in one file
// means if the backend DTO changes, there's exactly one place to update.

export type UserRole = "artist" | "planner" | "admin";

export interface SafeUser {
  id: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  phoneVerifiedAt?: string | null;
  emailVerifiedAt?: string | null;
  accountCode?: string;
  createdAt?: string;
  status: "active" | "pending_review" | "suspended" | "banned";
  // Set while an email change is awaiting confirmation — see
  // requestEmailChange/verifyEmail in the backend's auth.service.ts.
  pendingEmail?: string | null;
  [key: string]: unknown;
}

export interface LoginResponse {
  user: SafeUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: Extract<UserRole, "artist" | "planner">;
  phone?: string;
  // Both required. The API rejects anything but true on either — the
  // checkboxes are the user-facing half of a server-enforced rule, not
  // the rule itself.
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

export interface RegisterResponse {
  message: string;
}

export interface ApiErrorBody {
  message: string | string[];
  error?: string;
  statusCode?: number;
}
