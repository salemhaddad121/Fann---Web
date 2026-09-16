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
  /**
   * How many messages this plan still allows, or null when it is uncapped.
   *
   * null and 0 are different answers and must stay that way: an uncapped
   * plan shows no counter at all, a spent day pass shows "0 left". Counted
   * per period, so buying another pass resets it.
   */
  messages_remaining: number | null;
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
  /**
   * Who to send the money to, for a flow where the buyer moves it
   * themselves. Null for a provider that takes the payment itself.
   *
   * Structured rather than folded into `instructions`, and that is the
   * point of it: an account number inside a sentence cannot be made the
   * most prominent thing on the screen, given a copy button, or checked
   * for presence. The payment step shipped saying "Transfer $5.55. Quote
   * reference PLN-000015." and never once saying who to send it to.
   */
  recipient: PaymentRecipient | null;
}

export interface PaymentRecipient {
  /** Which service the transfer is made through, e.g. "Whish Money". */
  service: string;
  /** The name the account is registered under. Buyers check this. */
  accountName: string;
  /** Account number, or the phone number a wallet is keyed by. */
  accountNumber: string;
  /** Branch, IBAN or anything else the service needs. Often absent. */
  reference?: string;
  /** What to do if the transfer fails, bounces or is reversed. */
  ifItFails: string;
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

/**
 * The transfer services a buyer may SELECT today. Whish only.
 *
 * Mirrors TRANSFER_SERVICES in the API's subscriptions.dto.ts, and is
 * deliberately narrower than the payment_service enum behind it. That enum
 * still carries 'OMT' and 'WesternUnion' and is not migrated: historical
 * rows reference them, and the admin panel keeps its own label map
 * (PaymentsTab.tsx) covering all four so old payments stay readable. What a
 * new purchase may claim and what an old one already says are different
 * questions.
 *
 * Note the spelling. 'Wish' is wrong and is known to be wrong — it is the
 * enum value with seed data behind it, and both this page and the admin
 * panel map it to "Whish Money" for display. Do not add a second
 * misspelling, and do not fix this one here.
 */
export const TRANSFER_SERVICES = ["Wish", "other"] as const;
export type TransferService = (typeof TRANSFER_SERVICES)[number];
