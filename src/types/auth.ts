// These mirror src/auth/dto/auth.dto.ts and the shapes returned by
// auth.service.ts in the fann-api backend. Keeping them in one file
// means if the backend DTO changes, there's exactly one place to update.

export type UserRole = "artist" | "planner" | "admin";

/**
 * Individual vs company, for a booker. Mirrors the planner_kind enum from
 * the API's migration 028.
 *
 * It decides more than a label: the artist-facing planner directory lists
 * companies only, so a booker who says "just me" is never listed anywhere.
 */
export type PlannerKind = "individual" | "company";

/**
 * What a booker said they came for. Mirrors booker_interest from the same
 * migration.
 *
 * A booker-facing axis, deliberately not the artist-facing category groups:
 * artists classify by craft and bookers search by need, so a DJ is a
 * musician to himself and a service to a venue.
 */
export type BookerInterest =
  | "musical_acts"
  | "performance_acts"
  | "photo_video"
  | "djs_and_services";

export const BOOKER_INTERESTS: BookerInterest[] = [
  "musical_acts",
  "performance_acts",
  "photo_video",
  "djs_and_services",
];

/**
 * The buckets with the words a person reads, for the signup form and the
 * admin category picker. One list so the two cannot drift into describing
 * the same bucket differently.
 */
export const BOOKER_INTEREST_OPTIONS: { value: BookerInterest; label: string }[] = [
  { value: "musical_acts", label: "Musical acts" },
  { value: "performance_acts", label: "Performance acts" },
  { value: "photo_video", label: "Photo & video" },
  { value: "djs_and_services", label: "DJs, bartenders & event services" },
];

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

  // The booker questionnaire. Required by the API for role 'planner' and
  // rejected for an artist, so these are sent only on the booker branch.
  plannerKind?: PlannerKind;
  /** Only when plannerKind is 'company'. */
  bookerType?: string;
  /** Multi-select, minimum one. */
  interests?: BookerInterest[];
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
