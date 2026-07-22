"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getPlanner } from "@/lib/planners-api";
import { getPlannerReviews } from "@/lib/reviews-api";
import { AppShell } from "@/components/shell/AppShell";
import { PageBackground } from "@/components/shell/PageBackground";
import { PublicHeader } from "@/components/search/PublicHeader";
import { PlannerProfileView } from "@/components/profile/PlannerProfileView";
import type { PlannerDetail } from "@/types/planners";
import type { Review } from "@/types/reviews";
import { ApiError } from "@/lib/api";

function Content({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [planner, setPlanner] = useState<PlannerDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPlanner(id)
      .then(async (data) => {
        if (cancelled) return;
        setPlanner(data);
        // Reviews are keyed by the planner's user id, not the profile id in `id`.
        const r = await getPlannerReviews(data.user_id).catch(() => []);
        if (!cancelled) setReviews(r);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Couldn't load this profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;
  if (error || !planner) {
    return (
      <div className="px-4 py-10">
        <p className="text-sm text-danger mb-3">{error ?? "Booker not found."}</p>
        <Link href="/search" className="text-sm font-semibold text-sky">
          ← Back to search
        </Link>
      </div>
    );
  }

  const isOwnProfile = user?.id === planner.user_id;

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-muted">
          <i className="ti ti-arrow-left" /> Back
        </button>
      </div>

      <PlannerProfileView
        planner={planner}
        reviews={reviews}
        isOwnProfile={isOwnProfile}
        accountStatus={isOwnProfile ? user?.status : undefined}
      />

      {isOwnProfile && (
        <div className="sticky bottom-0 bg-white border-t border-hairline p-3 max-w-lg mx-auto">
          <Link
            href="/profile/edit"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] bg-sky text-white text-sm font-semibold"
          >
            <i className="ti ti-pencil text-sm" /> Edit profile
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PlannerDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return (
      <AppShell user={user} background="planner">
        <Content id={params.id} />
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen relative">
      <PageBackground role="planner" />
      <div className="relative z-10">
        <PublicHeader />
        <Content id={params.id} />
      </div>
    </div>
  );
}
