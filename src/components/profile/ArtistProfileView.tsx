"use client";

import { useState } from "react";
import Link from "next/link";
import { badgeColor } from "@/lib/badge-colors";
import { MediaLightbox } from "@/components/profile/MediaLightbox";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { LiveStatusBanner } from "@/components/profile/LiveStatusBanner";
import { AvailabilityCalendar } from "@/components/profile/AvailabilityCalendar";
import { LockedField, LockedName } from "@/components/profile/LockedField";
import type { ArtistDetail } from "@/types/artists";
import type { UserStatus } from "@/types/admin";

/**
 * Below this, the booking count is replaced by "New to Fann".
 *
 * 1 means only a genuine zero is suppressed. Raise it if a single booking
 * also reads as thin, but do not raise it far: hiding a real 3 is its own
 * kind of dishonesty.
 */
const MIN_BOOKINGS_TO_SHOW = 1;

function isUnavailableToday(artist: ArtistDetail): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return artist.availability.some((b) => b.start_date <= today && b.end_date >= today);
}

// Money, so cents show when there are any and stay hidden when there are
// none: a 75.50 deposit rendered "$75.5" by plain toLocaleString, which
// reads as a typo, while a round 100 does not want ".00" hung off it.
function formatMoney(value: number): string {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

// joined_at is a TIMESTAMP, so it arrives as a full ISO string rather
// than the bare "YYYY-MM-DD" the DATE columns give us.
function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function ArtistProfileView({
  artist,
  isOwnProfile = false,
  accountStatus,
  onPickDate,
}: {
  artist: ArtistDetail;
  isOwnProfile?: boolean;
  accountStatus?: UserStatus;
  // Passed only for a planner viewing someone else's profile — makes the
  // availability calendar clickable to start a booking request.
  onPickDate?: (dateKey: string) => void;
}) {
  const unavailableToday = isUnavailableToday(artist);
  const photos = artist.media.filter((m) => m.media_type === "photo");
  const videos = artist.media.filter((m) => m.media_type === "video");

  // Index into artist.media, not into `photos` — the hero and the strip
  // open the same viewer, so they have to agree on what the list is.
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  return (
    <div className="max-w-lg mx-auto pb-6">
      {isOwnProfile && accountStatus && <LiveStatusBanner role="artist" status={accountStatus} />}
      {/* Gallery.

          One gallery, not two. The top strip and the "Media" section
          further down showed the same photos from the same array — the
          second one was a duplicate, and on a phone it meant scrolling past
          the portfolio twice. The strip is the one that survives, now with
          a counter and tap-to-open, which is what the lower section's
          horizontal rail was really providing.

          Indexes are into artist.media, not into `photos`, because the
          lightbox walks the whole media list — including videos, which the
          hero frames do not show. */}
      {photos.length > 0 ? (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((i) => {
              const photo = photos[i];
              if (!photo) {
                return (
                  <div
                    key={i}
                    className="flex h-36 items-center justify-center rounded-2xl border border-hairline bg-sand text-[#e9d9c1]"
                  >
                    <i className="ti ti-microphone text-3xl" />
                  </div>
                );
              }
              const isLastTile = i === 1;
              const hidden = artist.media.length - 2;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setViewerIndex(artist.media.indexOf(photo))}
                  aria-label={`View media ${artist.media.indexOf(photo) + 1} of ${artist.media.length}`}
                  className="relative h-36 overflow-hidden rounded-2xl border border-hairline bg-sand"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.cdn_url} alt="" className="h-full w-full object-cover" />
                  {/* "+N more" on the second tile, so the rest of the
                      portfolio is discoverable now that the duplicate strip
                      below is gone. */}
                  {isLastTile && hidden > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-sm font-bold text-white">
                      +{hidden} more
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Counts what is actually there. The running "3 / 8" position
              belongs to the lightbox, which already draws it — printing a
              fixed "1 / 8" under a two-tile grid would just be wrong. */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted">
              {photos.length} photo{photos.length === 1 ? "" : "s"}
              {videos.length > 0 &&
                ` · ${videos.length} video${videos.length === 1 ? "" : "s"}`}
            </span>
            <button
              type="button"
              onClick={() => setViewerIndex(0)}
              className="py-1.5 text-xs font-semibold text-clay"
            >
              View all {videos.length > 0 ? "media" : "photos"} →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex h-36 items-center justify-center rounded-2xl border border-hairline bg-sand text-[#e9d9c1]"
            >
              <i className="ti ti-microphone text-3xl" />
            </div>
          ))}
        </div>
      )}

      {/* Identity */}
      <div className="px-4 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {artist.display_name ? (
                <span className="text-xl font-bold text-ink">{artist.display_name}</span>
              ) : (
                <span className="text-xl font-bold text-ink">
                  <LockedName width="9rem" />
                </span>
              )}
              {artist.is_verified && <i className="ti ti-rosette-discount-check text-clay text-lg" />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted flex-wrap">
              {/* Every category, not just the first. The "Categories"
                  section lower down used to repeat these in full while this
                  row showed one of them; with that section gone, this is
                  the only place they appear, so it has to carry all of
                  them. */}
              {artist.categories.map((c) => (
                <span
                  key={c.id}
                  className={`rounded-2xl px-2.5 py-1 text-xs font-semibold ${badgeColor(c.slug)}`}
                >
                  {c.name}
                </span>
              ))}
              {artist.location_city && (
                <span className="flex items-center gap-1">
                  <i className="ti ti-map-pin text-xs" />
                  {artist.location_city}
                  {artist.location_country ? `, ${artist.location_country}` : ""}
                </span>
              )}
            </div>
          </div>
          <span
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-2xl border ${
              unavailableToday
                ? "border-hairline text-faint"
                : "border-[#86EFAC] text-success"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${unavailableToday ? "bg-faint" : "bg-[#22C55E]"}`} />
            {unavailableToday ? "Booked today" : "Available"}
          </span>
        </div>

        {/* Stats — the star rating and review count were removed in favour of
            a plain count of completed bookings. */}
        <div className="flex border border-hairline rounded-xl overflow-hidden">
          {/* A zero in a prominent stat box actively costs the booking: it
              is read as "nobody has hired them" when it usually means "this
              profile is new, and Fann is new". Below the threshold the cell
              says so instead. The number is never invented — "New to Fann"
              is a fact about the account, not a stand-in figure. */}
          {(artist.bookings_count ?? 0) >= MIN_BOOKINGS_TO_SHOW ? (
            <Stat
              icon="ti-calendar-check"
              value={String(artist.bookings_count)}
              label={artist.bookings_count === 1 ? "Booking" : "Bookings"}
            />
          ) : (
            <Stat icon="ti-sparkles" value="New" label="to Fann" />
          )}
          {/* The exact figure is only sent to subscribers; everyone else
              gets a band instead. Showing the band rather than "—" is the
              point — a booker with a $300 budget needs to know whether to
              keep reading, and hiding price entirely just sends them to
              ask in a message they cannot send yet. */}
          <Stat
            icon="ti-currency-dollar"
            value={
              artist.base_price_usd != null
                ? `$${Number(artist.base_price_usd).toLocaleString()}`
                : (artist.base_price_band ?? "—")
            }
            label="From"
            last
          />
        </div>

        {artist.joined_at && (
          <p className="mt-2 text-xs text-faint text-center">
            Date joined {formatJoined(artist.joined_at)}
          </p>
        )}
      </div>

      {/* Availability, directly under the stats.

          It was five sections down, below About and Categories. Checking
          whether someone is free on your date before investing an evening
          in messaging them is the argument Fann's own wedding page makes
          for using Fann — that is the differentiator, and it was buried
          under the parts every directory has. */}
      <Section
        title="Availability"
        action={
          isOwnProfile ? (
            <Link href="/calendar" className="text-xs font-semibold text-clay">
              Manage →
            </Link>
          ) : undefined
        }
      >
        {/* The calendar replaces the old list of blocked date ranges —
            same grid the artist blocks dates on, with their unavailable
            days highlighted. The -mx-4 undoes Section's padding, since
            CalendarGrid brings its own. */}
        {onPickDate && (
          <p className="text-xs text-muted mb-1">
            Tap an available date to request a booking.
          </p>
        )}
        <div className="-mx-4">
          <AvailabilityCalendar blocks={artist.availability} onPickDate={onPickDate} />
        </div>
      </Section>


      {/* "About Karim" for a subscriber, "About this artist" otherwise —
          the first word of the name is no longer available to build a
          friendlier heading out of, and inventing one would be a leak. */}
      {artist.bio && (
        <Section
          title={
            artist.display_name
              ? `About ${artist.display_name.split(" ")[0]}`
              : "About this artist"
          }
        >
          <p className="text-[13px] text-muted leading-relaxed">{artist.bio}</p>
        </Section>
      )}

      {/* Booking terms are public — every tier gets them, including guests.
          They are what a booker needs to judge whether an artist is worth
          pursuing, and unlike a name or a number they cannot be used to
          book around the platform. Shown whenever the artist has set
          either; no tier check, because the server withholds neither. */}
      {(artist.deposit_usd != null || artist.cancellation_policy) && (
        <Section title="Booking terms">
          <div className="space-y-3">
            {artist.deposit_usd != null && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-faint">Deposit</span>
                <span className="text-sm font-semibold text-ink">
                  {/* 0 is a real answer, not a missing one. */}
                  {Number(artist.deposit_usd) > 0
                    ? `$${formatMoney(Number(artist.deposit_usd))}`
                    : "None required"}
                </span>
              </div>
            )}
            {artist.cancellation_policy && (
              <div>
                <p className="text-sm text-faint">Cancellation policy</p>
                <p className="mt-0.5 whitespace-pre-line text-sm text-ink-soft">
                  {artist.cancellation_policy}
                </p>
              </div>
            )}
          </div>
        </Section>
      )}

      {artist.social_links && Object.keys(artist.social_links).length > 0 && (
        <Section title="Connect">
          <SocialLinks links={artist.social_links} />
        </Section>
      )}

      {/* Absent rather than empty means the server withheld it. Showing a
          locked placeholder tells the viewer there is something here to
          unlock; rendering nothing would imply the artist simply has no
          links, which is a different and misleading message. */}
      {artist.social_links === undefined && artist.viewer_tier !== "subscribed" && (
        <Section title="Connect">
          <LockedField label="Social links" tier={artist.viewer_tier} lines={2} />
        </Section>
      )}

      <MediaLightbox
        items={artist.media}
        index={viewerIndex}
        onIndexChange={setViewerIndex}
        onClose={() => setViewerIndex(null)}
      />
    </div>
  );
}

function Stat({ icon, value, label, last }: { icon: string; value: string; label: string; last?: boolean }) {
  return (
    <div className={`flex-1 py-2.5 text-center ${last ? "" : "border-r border-hairline"}`}>
      <i className={`ti ${icon} text-base text-clay block mb-1`} />
      <div className="text-base font-bold text-ink">{value}</div>
      <div className="text-[10px] text-faint">{label}</div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[13px] font-bold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
