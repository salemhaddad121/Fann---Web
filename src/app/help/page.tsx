import type { Metadata } from "next";
import { HelpClient } from "./HelpClient";

export const metadata: Metadata = {
  title: "Help & contact",
  description:
    "Get help with booking artists, listing your work, payments and account questions on Fann, or contact the team directly.",
  alternates: { canonical: "/help" },
  openGraph: {
    url: "/help",
    title: "Help & contact",
    description: "Get help with bookings, listings, payments and account questions on Fann.",
  },
};

export default function HelpPage() {
  return <HelpClient />;
}
