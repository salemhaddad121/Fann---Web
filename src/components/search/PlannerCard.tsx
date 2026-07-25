import Link from "next/link";
import { badgeColor } from "@/lib/badge-colors";
import type { PlannerCard as PlannerCardType } from "@/types/planners";

export function PlannerCard({ planner }: { planner: PlannerCardType }) {
  const primaryEventType = planner.event_types?.[0];

  return (
    <Link
      href={`/planners/${planner.id}`}
      className="bg-white border border-hairline rounded-[14px] overflow-hidden flex flex-col"
    >
      <div className="relative w-full pt-[64%] bg-mist">
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
            className={`absolute bottom-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-lg ${badgeColor(primaryEventType)}`}
          >
            {primaryEventType}
          </span>
        )}
      </div>

      <div className="flex-1 px-2.5 py-2 flex flex-col gap-0.5">
        <div className="text-xs font-semibold text-ink truncate">{planner.display_name}</div>
        {planner.company_name && (
          <div className="text-[10px] text-faint truncate">{planner.company_name}</div>
        )}
        {planner.booker_type && (
          <div className="text-[10px] font-semibold text-sky truncate">{planner.booker_type}</div>
        )}
        {planner.location_city && (
          <div className="text-[10px] text-muted flex items-center gap-1">
            <i className="ti ti-map-pin text-[10px]" />
            {planner.location_city}
          </div>
        )}
      </div>
    </Link>
  );
}
