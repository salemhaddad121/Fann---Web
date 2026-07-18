"use client";

import { useState } from "react";
import { formatBlockRange } from "@/lib/calendar";
import type { AvailabilityBlock } from "@/types/artists";

export function BlockedDatesList({
  blocks,
  onDelete,
}: {
  blocks: AvailabilityBlock[];
  onDelete: (id: string) => Promise<void>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (blocks.length === 0) {
    return (
      <p className="text-center text-sm text-faint py-5">
        No blocked dates. Tap a date above or use &quot;Add dates&quot;.
      </p>
    );
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((b) => {
        const days = Math.round(
          (new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / 86400000,
        ) + 1;
        return (
          <div
            key={b.id}
            className="flex items-center gap-2.5 border border-hairline rounded-xl px-3.5 py-2.5"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink">
                {formatBlockRange(b.start_date, b.end_date)}
              </div>
              <div className="text-[11px] text-faint">
                {days} day{days === 1 ? "" : "s"} blocked{b.note ? ` · ${b.note}` : ""}
              </div>
            </div>
            <button
              onClick={() => handleDelete(b.id)}
              disabled={deletingId === b.id}
              aria-label="Remove block"
              className="w-7 h-7 rounded-full border border-hairline flex items-center justify-center text-faint hover:bg-danger-bg hover:text-danger hover:border-[#FCA5A5] disabled:opacity-50"
            >
              <i className="ti ti-trash text-sm" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
