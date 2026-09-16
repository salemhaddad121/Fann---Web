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
  // Optional in both senses: the field may be omitted, and sending false is
  // a valid signup. §24.2 requires marketing consent to be separable from
  // accepting the Terms, so refusing it must never block an account.
  acceptedMarketing?: boolean;
}

export interface RegisterResponse {
  message: string;
}

export interface ApiErrorBody {
  message: string | string[];
  error?: string;
  statusCode?: number;
  /**
   * A machine-readable reason, set by the API on the errors a client has to
   * do something different about. Only EMAIL_NOT_VERIFIED so far.
   *
   * It exists because prose is not a contract: "wrong password" and "you
   * have not verified your email yet" are both a 401 on /auth/login and
   * need completely different screens, and matching on the message text
   * breaks the first time someone rewords it.
   */
  code?: string;
}

/**
 * Login was refused because the address has never been verified. The screen
 * for this offers to resend the link; it is not a credentials problem and
 * must not be shown as one.
 */
export const EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";
