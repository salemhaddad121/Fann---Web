import type { Metadata } from "next";
import { PlansClient } from "./PlansClient";

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

export default function PlansPage() {
  return <PlansClient />;
}
