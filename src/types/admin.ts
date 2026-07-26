export type UserStatus = "pending_review" | "active" | "suspended" | "banned";

export interface AdminUserRow {
  id: string;
  email: string;
  phone: string | null;
  role: "artist" | "planner" | "admin";
  status: UserStatus;
  account_code: string;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  deleted_at: string | null;
  display_name: string | null;
  is_verified: boolean;
  thumbnail_url: string | null;
}

export interface AdminUserDetail extends AdminUserRow {
  doc_status: string | null;
  doc_rejection_reason: string | null;
  doc_reviewed_at: string | null;
  artist_profile: Record<string, unknown> | null;
  planner_profile: Record<string, unknown> | null;
  latest_payment?: AdminPayment | null;
}

export interface AdminIdDocument {
  id: string;
  user_id: string;
  status: string;
  uploaded_at: string;
  email: string;
  role: string;
  account_code: string;
  display_name: string | null;
}

export interface AdminPayment {
  id: string;
  planner_id: string;
  amount_usd: string | number;
  transfer_service: string;
  reference_code: string | null;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
  email?: string;
  account_code?: string;
  display_name?: string | null;
  company_name?: string | null;
}

export interface AdminFlag {
  id: string;
  target_type: "profile" | "message" | "conversation";
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter_id: string;
  reporter_email: string;
  reporter_account_code: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  target_id: string;
  note: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  admin_email: string;
  admin_account_code: string;
}

export interface AdminCategoryGroup {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
  category_count: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  group_id: string;
  group_name: string;
  group_slug: string;
  created_at: string;
  artist_count: number;
}

export interface AdminReview {
  id: string;
  overall_score: number;
  body: string | null;
  is_visible: boolean;
  reviewer_role: "artist" | "planner";
  submitted_at: string;
  reviewer_email: string;
  reviewee_email: string;
  event_name: string;
  event_date: string;
}

export interface AdminStats {
  users: { role: string; status: string; count: string | number }[];
  pendingIdDocuments: number;
  pendingPayments: number;
  openFlags: number;
}

export interface SignupTrendPoint {
  date: string;
  artists: number;
  planners: number;
}

export interface GeographyRow {
  city: string;
  count: number;
}

// Confirmed bookings only (accepted + completed). Note an artist can hold
// several categories, so one booking counts toward each of them — these
// answer "how many bookings involved this category" and will not sum to
// the total booking count.
export interface BookedCategoryRow {
  category: string;
  count: number;
}

// Average FOREGROUND time per active day, per role. Users with no activity
// in the window are excluded rather than counted as zero — this measures
// how long engaged people stay, not how many people show up.
export interface EngagementRow {
  role: string;
  avgMsPerActiveDay: number;
  users: number;
}

export interface EngagementStats {
  windowDays: number;
  overall: EngagementRow[];
  search: EngagementRow[];
}

export interface BookerTypeRow {
  bookerType: string;
  count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}
