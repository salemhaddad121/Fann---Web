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
  [key: string]: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: SafeUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: Extract<UserRole, "artist" | "planner">;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ApiErrorBody {
  message: string | string[];
  error?: string;
  statusCode?: number;
}
