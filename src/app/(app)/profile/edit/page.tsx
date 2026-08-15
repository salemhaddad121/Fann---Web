"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getMyArtistProfile, updateMyArtistProfile, getCategories } from "@/lib/artists-api";
import { getMyPlannerProfile, updateMyPlannerProfile } from "@/lib/planners-api";
import { FormField } from "@/components/auth/FormField";
import { Button } from "@/components/auth/Button";
import { Banner } from "@/components/auth/Banner";
import { ChipInput } from "@/components/profile/ChipInput";
import { BOOKER_TYPES } from "@/types/planners";
import { MediaManager } from "@/components/profile/MediaManager";
import { decimalOnly } from "@/lib/numeric-input";
import {
  REQUIRED_GALLERY_IMAGES,
  REQUIRED_PROFILE_PICTURES,
  mediaShortfall,
} from "@/lib/profile-completeness";
import { ComingSoon } from "@/components/shell/ComingSoon";
import type { CategoryGroup, MediaItem } from "@/types/artists";

const SOCIAL_PLATFORMS = ["instagram", "youtube", "spotify", "tiktok", "facebook", "website"] as const;

function SocialLinksEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  return (
    <div className="mb-4">
      <span className="block text-xs font-semibold text-ink mb-1.5">Social links</span>
      <div className="flex flex-col gap-2">
        {SOCIAL_PLATFORMS.map((platform) => (
          <input
            key={platform}
            value={value[platform] ?? ""}
            onChange={(e) => onChange({ ...value, [platform]: e.target.value })}
            placeholder={`${platform[0].toUpperCase()}${platform.slice(1)} URL`}
            className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-clay"
          />
        ))}
      </div>
    </div>
  );
}

function ArtistEditForm({ accent }: { accent: string }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMyArtistProfile(), getCategories()])
      .then(([profile, groups]) => {
        if (cancelled) return;
        setDisplayName(profile.display_name ?? "");
        setBio(profile.bio ?? "");
        setCity(profile.location_city ?? "");
        setCountry(profile.location_country ?? "");
        setPrice(profile.base_price_usd != null ? String(profile.base_price_usd) : "");
        setDeposit(profile.deposit_usd != null ? String(profile.deposit_usd) : "");
        setCancellationPolicy(profile.cancellation_policy ?? "");
        setLanguages(profile.languages ?? []);
        setSocialLinks(profile.social_links ?? {});
        setCategoryIds(profile.categories.map((c) => c.id));
        setMedia(profile.media ?? []);
        setCategoryGroups(groups);
        setLoaded(true);
      })
      .catch(() => setError("Couldn't load your profile."));
    return () => {
      cancelled = true;
    };
  }, []);

  // Recomputed on every render so the notice tracks uploads and deletions
  // immediately, rather than waiting for a save round trip.
  const missingMedia = mediaShortfall(media);

  function toggleCategory(id: string) {
    setCategoryIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 4) return prev; // matches backend's ArrayMaxSize(4)
      return [...prev, id];
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateMyArtistProfile({
        displayName,
        bio,
        locationCity: city,
        locationCountry: country,
        basePriceUsd: price ? Number(price) : undefined,
        // Empty means "not set" and 0 means "no deposit"; both are valid and
        // the column allows either, so an empty box sends nothing rather
        // than coercing to 0.
        depositUsd: deposit === "" ? undefined : Number(deposit),
        cancellationPolicy: cancellationPolicy.trim() || undefined,
        languages,
        socialLinks: Object.fromEntries(Object.entries(socialLinks).filter(([, v]) => v)),
        categoryIds: categoryIds.length ? categoryIds : undefined,
      });
      router.push("/profile");
    } catch {
      setError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto pb-24">
      {error && <Banner kind="error">{error}</Banner>}

      <FormField label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      <label className="block mb-4">
        <span className="block text-xs font-semibold text-ink mb-1.5">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-clay"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <FormField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Starting price (USD)"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        {/* Numeric so it can be compared and shown alongside the price.
            decimalOnly strips anything that is not a number as it is typed —
            "50%" or "half" would otherwise be silently dropped by Number()
            on save and read as "no deposit". */}
        <FormField
          label="Deposit (USD)"
          inputMode="decimal"
          value={deposit}
          onChange={(e) => setDeposit(decimalOnly(e.target.value))}
          placeholder="0"
        />
      </div>
      <p className="-mt-3 mb-4 text-xs text-faint">
        Leave the deposit empty or 0 if you don&apos;t take one.
      </p>

      <label className="block mb-4">
        <span className="block text-xs font-semibold text-ink mb-1.5">
          Cancellation policy
        </span>
        <textarea
          value={cancellationPolicy}
          onChange={(e) => setCancellationPolicy(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="e.g. Full refund up to 14 days before the event, 50% after that."
          className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-clay"
        />
      </label>

      <ChipInput label="Languages" values={languages} onChange={setLanguages} placeholder="e.g. Arabic" />

      <MediaManager media={media} onChange={setMedia} />

      {/* Artists only — the planner form below has no such requirement.
          Stated before saving and updated as photos are added or removed,
          so it is visible while it can still be acted on rather than
          arriving as a rejection afterwards. */}
      {missingMedia.length > 0 && (
        <p className="-mt-2 mb-4 flex items-start gap-1.5 text-xs text-clay-deep">
          <i className="ti ti-alert-circle mt-px text-sm" aria-hidden />
          <span>
            A profile needs {REQUIRED_PROFILE_PICTURES} profile picture and{" "}
            {REQUIRED_GALLERY_IMAGES} gallery images before it&apos;s ready to show
            bookers. Still missing: {missingMedia.join(" and ")}.
          </span>
        </p>
      )}

      <div className="mb-4">
        <span className="block text-xs font-semibold text-ink mb-1.5">Categories (up to 4)</span>
        {categoryGroups.map((group) => (
          <div key={group.id} className="mb-2">
            <p className="text-[11px] font-semibold text-faint uppercase tracking-wide mb-1">{group.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCategory(c.id)}
                  disabled={!categoryIds.includes(c.id) && categoryIds.length >= 4}
                  className={`text-xs px-3 py-1 rounded-2xl border disabled:opacity-40 ${
                    categoryIds.includes(c.id)
                      ? "bg-sand text-clay border-[#e0a570] font-semibold"
                      : "border-hairline text-muted"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SocialLinksEditor value={socialLinks} onChange={setSocialLinks} />

      <Button type="submit" loading={saving} className={accent}>
        Save changes
      </Button>
    </form>
  );
}

function PlannerEditForm({ accent }: { accent: string }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [bookerType, setBookerType] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    getMyPlannerProfile()
      .then((profile) => {
        if (cancelled) return;
        setDisplayName(profile.display_name ?? "");
        setCompanyName(profile.company_name ?? "");
        setBio(profile.bio ?? "");
        setCity(profile.location_city ?? "");
        setCountry(profile.location_country ?? "");
        setEventTypes(profile.event_types ?? []);
        setBookerType(profile.booker_type ?? "");
        setSocialLinks(profile.social_links ?? {});
        setMedia(profile.media ?? []);
        setLoaded(true);
      })
      .catch(() => setError("Couldn't load your profile."));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateMyPlannerProfile({
        displayName,
        companyName,
        bio,
        locationCity: city,
        locationCountry: country,
        eventTypes,
        bookerType: bookerType || undefined,
        socialLinks: Object.fromEntries(Object.entries(socialLinks).filter(([, v]) => v)),
      });
      router.push("/profile");
    } catch {
      setError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto pb-24">
      {error && <Banner kind="error">{error}</Banner>}

      <FormField label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      <FormField label="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      <label className="block mb-4">
        <span className="block text-xs font-semibold text-ink mb-1.5">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-teal"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <FormField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>

      <label className="block mb-4">
        <span className="block text-xs font-semibold text-ink mb-1.5">Type of booker</span>
        <select
          value={bookerType}
          onChange={(e) => setBookerType(e.target.value)}
          className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-teal bg-surface"
        >
          <option value="">Select a type…</option>
          {BOOKER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <ChipInput label="Events you host" values={eventTypes} onChange={setEventTypes} placeholder="e.g. Wedding" />

      <MediaManager media={media} onChange={setMedia} />

      <SocialLinksEditor value={socialLinks} onChange={setSocialLinks} />

      <Button type="submit" loading={saving} className={accent}>
        Save changes
      </Button>
    </form>
  );
}

export default function EditProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "admin") {
    return <ComingSoon title="Edit profile" blurb="Admin accounts don't have a public artist/planner profile to edit." />;
  }

  const isPlanner = user.role === "planner";
  return isPlanner ? (
    <PlannerEditForm accent="bg-teal" />
  ) : (
    <ArtistEditForm accent="bg-clay" />
  );
}
