import type { Metadata } from "next";
import { Suspense } from "react";
import { UnsubscribeClient } from "./UnsubscribeClient";

export const metadata: Metadata = {
  title: "Unsubscribe",
  // Never in search results: the page is only meaningful with a token, and
  // an indexed copy without one is a dead end for anyone who lands on it.
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeClient />
    </Suspense>
  );
}
