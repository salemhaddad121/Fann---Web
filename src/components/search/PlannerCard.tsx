import Link from "next/link";
import { badgeColor } from "@/lib/badge-colors";
import type { PlannerCard as PlannerCardType } from "@/types/planners";

// Matches ArtistCard's name banner — see the note there.
const NAME_BANNER_GRADIENT = "linear-gradient(rgba(11,29,81,0), rgba(11,29,81,0.92))";

export function PlannerCard({ planner }: { planner: PlannerCardType }) {
  const primaryEventType = planner.event_types?.[0];
  const subtitle = [planner.company_name, planner.booker_type, planner.location_city]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/planners/${planner.id}`}
      className="bg-white border border-hairline rounded-[14px] overflow-hidden flex flex-col"
    >
      {/* Portrait frame to match ArtistCard — see the note there. */}
      <div className="relative w-full pt-[120%] bg-mist">
        {planner.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- external CDN URLs, no next.config domain list set up yet
          <img
            src={planner.thumbnail_url}
            alt={planner.display_name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-faint">
            <i className="ti ti-building-store text-2xl" />
          </div>
        )}
        {primaryEventType && (
          <span
            className={`absolute top-1.5 left-1.5 z-10 text-[10px] font-semibold px-2 py-0.5 rounded-lg ${badgeColor(primaryEventType)}`}
          >
            {primaryEventType}
          </span>
        )}

        <div
          className="absolute inset-x-0 bottom-0 px-[13px] pb-[11px] pt-[46px] text-white"
          style={{ backgroundImage: NAME_BANNER_GRADIENT }}
        >
          <div className="font-bold text-[15px] leading-[1.15] truncate">{planner.display_name}</div>
          {subtitle && <div className="text-[11px] opacity-90 mt-0.5 truncate">{subtitle}</div>}
        </div>
      </div>
    </Link>
  );
}
