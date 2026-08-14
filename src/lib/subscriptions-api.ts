import { apiFetch } from "@/lib/api";
import type {
  MyPayment,
  MySubscriptions,
  PaymentIntent,
  PlanCode,
  SubscriptionPlan,
  SubscriptionRow,
  TransferService,
} from "@/types/subscriptions";

// Public — the pricing page is where a locked profile sends a guest, so it
// has to load without a session.
export async function listPlans(): Promise<SubscriptionPlan[]> {
  return apiFetch<SubscriptionPlan[]>("/subscriptions/plans", { auth: false });
}

export async function getMySubscriptions(): Promise<MySubscriptions> {
  return apiFetch<MySubscriptions>("/subscriptions/me");
}

/** Starts the 24-hour clock on a banked day-pass credit. */
export async function activateSubscription(id: string): Promise<SubscriptionRow> {
  return apiFetch<SubscriptionRow>(`/subscriptions/${id}/activate`, { method: "POST" });
}

export async function createPaymentIntent(
  planCode: PlanCode,
  quantity = 1,
): Promise<PaymentIntent> {
  return apiFetch<PaymentIntent>("/payments", {
    method: "POST",
    body: { planCode, quantity },
  });
}

export async function listMyPayments(): Promise<MyPayment[]> {
  return apiFetch<MyPayment[]>("/payments/me");
}

export async function reportTransfer(
  paymentId: string,
  transferService: TransferService,
  referenceCode: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/payments/${paymentId}/transfer`, {
    method: "PATCH",
    body: { transferService, referenceCode },
  });
}
