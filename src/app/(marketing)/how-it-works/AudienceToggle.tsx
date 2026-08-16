"use client";

import { useState } from "react";

/**
 * The two-audience switch.
 *
 * One page with a toggle rather than two pages, because the flows are short
 * and the audiences overlap at the top of the funnel — plenty of people
 * arrive not yet knowing which side of the marketplace they are on.
 *
 * Both panels are rendered and one is hidden with CSS rather than being
 * mounted on demand, so both sets of copy are in the HTML and a crawler
 * indexes the whole page. Hiding with `hidden` also keeps the inactive
 * panel out of the accessibility tree and out of in-page find.
 */
export function AudienceToggle({
  artistPanel,
  plannerPanel,
}: {
  artistPanel: React.ReactNode;
  plannerPanel: React.ReactNode;
}) {
  const [audience, setAudience] = useState<"planner" | "artist">("planner");

  const tab = (value: "planner" | "artist", label: string) => {
    const active = audience === value;
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        aria-controls={`panel-${value}`}
        id={`tab-${value}`}
        onClick={() => setAudience(value)}
        className={`flex-1 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors ${
          active ? "bg-ink text-white" : "text-muted"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Choose your side of the marketplace"
        className="flex max-w-md gap-1 rounded-[12px] border border-hairline bg-surface/85 p-1"
      >
        {tab("planner", "I'm booking")}
        {tab("artist", "I'm performing")}
      </div>

      <div
        role="tabpanel"
        id="panel-planner"
        aria-labelledby="tab-planner"
        hidden={audience !== "planner"}
        className="mt-8 flex flex-col gap-8"
      >
        {plannerPanel}
      </div>

      <div
        role="tabpanel"
        id="panel-artist"
        aria-labelledby="tab-artist"
        hidden={audience !== "artist"}
        className="mt-8 flex flex-col gap-8"
      >
        {artistPanel}
      </div>
    </div>
  );
}
