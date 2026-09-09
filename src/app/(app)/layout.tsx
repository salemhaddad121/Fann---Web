"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/shell/AppShell";
import { ReacceptancePrompt } from "@/components/legal/ReacceptancePrompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  // Above the page rather than inside it, so an amendment is seen once per
  // session wherever the user happens to be, not only if they visit
  // Settings. Renders nothing when there is nothing outstanding.
  return (
    <AppShell user={user}>
      <ReacceptancePrompt />
      {children}
    </AppShell>
  );
}
