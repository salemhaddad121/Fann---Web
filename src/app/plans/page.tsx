import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PlansClient } from "./PlansClient";
import { TwaPlansNotice } from "./TwaPlansNotice";
import { TWA_FLAG } from "@/lib/twa-context";

export const metadata: Metadata = {
  title: "Plans & pricing",
  description:
    "Artists list on Fann for free. Event planners subscribe to unlock artist contact details and message directly — day, month and year plans, no booking commissions.",
  alternates: { canonical: "/plans" },
  openGraph: {
    url: "/plans",
    title: "Plans & pricing",
    description:
      "Artists are free. Planners subscribe to unlock contact details and message directly. No booking commissions.",
  },
};

export default async function PlansPage() {
  // Decided on the server so the pricing never reaches the app at all.
  // Doing this on the client would ship the prices in the HTML and then
  // replace them, which is a flash of exactly the content Play's billing
  // policy is concerned with.
  //
  // This makes the route dynamic. That is the cost of the guarantee, and
  // /plans is not an SEO target worth trading it for.
  const inApp = (await cookies()).has(TWA_FLAG);

  if (inApp) return <TwaPlansNotice />;

  return <PlansClient />;
}
