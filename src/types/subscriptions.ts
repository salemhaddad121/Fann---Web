export type PlanCode = "day" | "month" | "year";

export type SubscriptionStatus = "ready" | "active" | "queued" | "expired" | "cancelled";

export interface SubscriptionPlan {
  code: PlanCode;
  price_usd: number;
  duration_days: number;
  requires_id_doc: boolean;
  /** null means uncapped. Day passes are capped; month and year are not. */
  message_cap: number | null;
}

/** Dates arrive as ISO strings over JSON, never as Date objects. */
export interface SubscriptionRow {
  id: string;
  plan_code: PlanCode;
  status: SubscriptionStatus;
  payment_id: string | null;
  activated_at: string | null;
  starts_at: string | null;
  /** Null on queued rows — the real expiry is computed when it is promoted. */
  expires_at: string | null;
  created_at: string;
  duration_days: number;
  message_cap: number | null;
}

export interface ActiveSubscription {
  id: string;
  user_id: string;
  plan_code: PlanCode;
  status: SubscriptionStatus;
  activated_at: string | null;
  starts_at: string | null;
  expires_at: string | null;
  requires_id_doc: boolean;
  message_cap: number | null;
}

export interface MySubscriptions {
  active: ActiveSubscription | null;
  queued: SubscriptionRow[];
  credits: { available: number; rows: SubscriptionRow[] };
  history: SubscriptionRow[];
}

export interface PaymentIntent {
  provider: string;
  // Exactly one of these is set. redirect_url means a hosted checkout to
  // send the buyer to; instructions means a reference-matching or manual
  // flow with nowhere to redirect. Branch on which is present.
  redirect_url: string | null;
  instructions: string | null;
  id: string;
  plan_code: PlanCode;
  quantity: number;
  amount_usd: number;
  currency: string;
  status: string;
  created_at: string;
  /** The reconciliation code the buyer must quote on the transfer. */
  account_code: string | null;
}

export interface MyPayment {
  id: string;
  plan_code: PlanCode | null;
  quantity: number;
  amount_usd: number;
  currency: string;
  status: string;
  provider: string;
  transfer_service: string | null;
  reference_code: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export const TRANSFER_SERVICES = ["OMT", "Wish", "WesternUnion", "other"] as const;
export type TransferService = (typeof TRANSFER_SERVICES)[number];
