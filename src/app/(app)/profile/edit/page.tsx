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
import { MediaManager } from "@/components/profile/MediaManager";
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
            className="w-full rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-indigo"
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
          className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-indigo"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <FormField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>
      <FormField
        label="Starting price (USD)"
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <ChipInput label="Languages" values={languages} onChange={setLanguages} placeholder="e.g. Arabic" />

      <MediaManager media={media} onChange={setMedia} />

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
                      ? "bg-mist text-indigo border-[#93ADE8] font-semibold"
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
          className="w-full rounded-[10px] border border-hairline px-3.5 py-2.5 text-sm outline-none focus:border-sky"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <FormField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>

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
    <PlannerEditForm accent="bg-sky" />
  ) : (
    <ArtistEditForm accent="bg-indigo" />
  );
}
