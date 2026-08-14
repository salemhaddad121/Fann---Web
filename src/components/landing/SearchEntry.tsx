"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The landing page's way into search.
 *
 * Submits to /search rather than searching in place: the results page
 * already owns filters, pagination and the category grid, and duplicating
 * any of that here would be a second implementation to keep in step.
 */
export function SearchEntry() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <i
            aria-hidden
            className="ti ti-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search DJs, photographers, bands…"
            aria-label="Search artists"
            className="w-full rounded-[10px] border border-hairline bg-surface py-3 pl-10 pr-3 text-sm text-ink outline-none placeholder:text-faint focus:border-clay"
          />
        </div>
        <button
          type="submit"
          className="rounded-[10px] bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          Browse artists
        </button>
      </div>
      <p className="mt-2 text-xs text-faint">
        No account needed to browse.
      </p>
    </form>
  );
}
