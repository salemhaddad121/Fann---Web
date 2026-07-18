import { SocialLinks } from "@/components/profile/SocialLinks";
import { ReviewList } from "@/components/profile/ReviewList";
import { LiveStatusBanner } from "@/components/profile/LiveStatusBanner";
import { MediaStrip } from "@/components/profile/MediaStrip";
import type { PlannerDetail } from "@/types/planners";
import type { Review } from "@/types/reviews";
import type { UserStatus } from "@/types/admin";

export function PlannerProfileView({
  planner,
  reviews,
  isOwnProfile = false,
  accountStatus,
}: {
  planner: PlannerDetail;
  reviews: Review[];
  isOwnProfile?: boolean;
  accountStatus?: UserStatus;
}) {
  return (
    <div className="max-w-lg mx-auto pb-6">
      {isOwnProfile && accountStatus && <LiveStatusBanner role="planner" status={accountStatus} />}
      {/* Hero */}
      <div className="p-4">
        <div className="rounded-2xl overflow-hidden h-40 border border-hairline bg-mist">
          {planner.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={planner.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#93C5E8]">
              <i className="ti ti-building-store text-3xl" />
            </div>
          )}
        </div>
      </div>

      {/* Identity */}
      <div className="px-4 pb-4">
        <div className="text-xl font-bold text-ink mb-0.5">{planner.display_name}</div>
        {planner.company_name && <p className="text-sm text-faint mb-1.5">{planner.company_name}</p>}
        {planner.location_city && (
          <p className="text-xs text-muted flex items-center gap-1 mb-3">
            <i className="ti ti-map-pin text-xs" />
            {planner.location_city}
            {planner.location_country ? `, ${planner.location_country}` : ""}
          </p>
        )}

        <div className="flex border border-hairline rounded-xl overflow-hidden">
          <Stat
            icon="ti-star"
            value={planner.avg_rating != null ? Number(planner.avg_rating).toFixed(1) : "New"}
            label="Rating"
          />
          <Stat icon="ti-users" value={String(planner.review_count)} label="Reviews" last />
        </div>
      </div>

      {planner.media.length > 0 && (
        <Section title="Media">
          <MediaStrip media={planner.media} />
        </Section>
      )}

      {planner.bio && (
        <Section title="About">
          <p className="text-[13px] text-muted leading-relaxed">{planner.bio}</p>
        </Section>
      )}

      {planner.event_types?.length > 0 && (
        <Section title="Events they host">
          <div className="flex flex-wrap gap-1.5">
            {planner.event_types.map((type) => (
              <span key={type} className="text-xs px-3 py-1 rounded-2xl border border-hairline text-muted">
                {type}
              </span>
            ))}
          </div>
        </Section>
      )}

      {planner.social_links && Object.keys(planner.social_links).length > 0 && (
        <Section title="Connect">
          <SocialLinks links={planner.social_links} />
        </Section>
      )}

      <Section title={`Reviews (${reviews.length})`}>
        <ReviewList reviews={reviews} />
      </Section>
    </div>
  );
}

function Stat({ icon, value, label, last }: { icon: string; value: string; label: string; last?: boolean }) {
  return (
    <div className={`flex-1 py-2.5 text-center ${last ? "" : "border-r border-hairline"}`}>
      <i className={`ti ${icon} text-base text-sky block mb-1`} />
      <div className="text-base font-bold text-ink">{value}</div>
      <div className="text-[10px] text-faint">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4">
      <h2 className="text-[13px] font-bold text-ink mb-2">{title}</h2>
      {children}
    </div>
  );
}
