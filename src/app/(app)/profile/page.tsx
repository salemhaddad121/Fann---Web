"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getMyArtistProfile, getArtistAvailability } from "@/lib/artists-api";
import { getMyPlannerProfile } from "@/lib/planners-api";
import { getArtistReviews, getPlannerReviews } from "@/lib/reviews-api";
import { ArtistProfileView } from "@/components/profile/ArtistProfileView";
import { PlannerProfileView } from "@/components/profile/PlannerProfileView";
import { ComingSoon } from "@/components/shell/ComingSoon";
import type { ArtistDetail } from "@/types/artists";
import type { PlannerDetail } from "@/types/planners";
import type { Review } from "@/types/reviews";
import type { UserStatus } from "@/types/admin";

function ArtistOwnProfile({ userId, status }: { userId: string; status: UserStatus }) {
  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profile, availability, reviewList] = await Promise.all([
          getMyArtistProfile(),
          getArtistAvailability(userId).catch(() => []),
          getArtistReviews(userId).catch(() => []),
        ]);
        if (cancelled) return;
        setArtist({ ...profile, availability });
        setReviews(reviewList);
      } catch {
        if (!cancelled) setError("Couldn't load your profile. Try refreshing.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!artist) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  return <ArtistProfileView artist={artist} reviews={reviews} isOwnProfile accountStatus={status} />;
}

function PlannerOwnProfile({ userId, status }: { userId: string; status: UserStatus }) {
  const [planner, setPlanner] = useState<PlannerDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profile, reviewList] = await Promise.all([
          getMyPlannerProfile(),
          getPlannerReviews(userId).catch(() => []),
        ]);
        if (cancelled) return;
        setPlanner(profile);
        setReviews(reviewList);
      } catch {
        if (!cancelled) setError("Couldn't load your profile. Try refreshing.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (error) return <p className="px-4 py-10 text-sm text-danger">{error}</p>;
  if (!planner) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  return <PlannerProfileView planner={planner} reviews={reviews} isOwnProfile accountStatus={status} />;
}

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "admin") {
    return <ComingSoon title="Profile" blurb="Admin accounts don't have a public artist/planner profile." />;
  }

  return (
    <div>
      {user.role === "artist" ? (
        <ArtistOwnProfile userId={user.id} status={user.status} />
      ) : (
        <PlannerOwnProfile userId={user.id} status={user.status} />
      )}

      <div className="sticky bottom-0 bg-white border-t border-hairline p-3 max-w-lg mx-auto">
        <Link
          href="/profile/edit"
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-white text-sm font-semibold ${
            user.role === "planner" ? "bg-sky" : "bg-indigo"
          }`}
        >
          <i className="ti ti-pencil text-sm" /> Edit profile
        </Link>
      </div>
    </div>
  );
}
