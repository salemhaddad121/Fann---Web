"use client";

import { useState } from "react";
import type { Review } from "@/types/reviews";

function Stars({ score }: { score: number }) {
  const rounded = Math.round(score);
  return (
    <div className="flex gap-0.5 text-[#2B52E8]">
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} className={`ti text-xs ${i < rounded ? "ti-star-filled" : "ti-star"}`} />
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? reviews : reviews.slice(0, 5);

  if (reviews.length === 0) {
    return <p className="text-sm text-faint">No reviews yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((r) => (
        <div key={r.id} className="border border-hairline rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-semibold text-ink">
              {r.reviewer_display_name ?? "Anonymous"}
            </span>
            <span className="text-[11px] text-faint">{formatDate(r.submitted_at)}</span>
          </div>
          <Stars score={r.overall_score} />
          {r.body && <p className="text-[13px] text-muted leading-relaxed mt-2">{r.body}</p>}
        </div>
      ))}

      {reviews.length > 5 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold text-indigo self-start"
        >
          {expanded ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
        </button>
      )}
    </div>
  );
}
