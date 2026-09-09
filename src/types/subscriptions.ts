export type PlanCode = "day" | "month" | "year";

export type SubscriptionStatus = "ready" | "active" | "queued" | "expired" | "cancelled";

export interface SubscriptionPlan {
  code: PlanCode;
  /** NET, excluding VAT. The gross is only settled at checkout. */
  price_usd: number;
  /** 0 means Fann is not charging VAT, and nothing should mention it. */
  vat_rate: number;
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
  /** Net, before VAT. */
  subtotal_usd: number;
  /** The rate applied to THIS payment, not today's configured rate. */
  vat_rate: number;
  vat_usd: number;
  /** Gross — subtotal_usd + vat_usd. This is the figure to transfer. */
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
  subtotal_usd: number;
  vat_rate: number;
  vat_usd: number;
  /** Gross. What was actually owed. */
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
