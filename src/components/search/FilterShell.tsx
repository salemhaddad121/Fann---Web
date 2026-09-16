"use client";

import { useEffect } from "react";

/**
 * Where the filter controls live, at both sizes.
 *
 * Both halves exist for the same reason: you should be able to see the
 * results while you narrow them. The old panel was an inline expander that
 * pushed the grid down, so opening Filters hid the very thing you were
 * filtering — and the result count, the one number that tells you whether
 * the filter did what you wanted, went off-screen at the moment it changed.
 *
 *   FilterRail   >=1024px. Sticky, 264px, always open. The grid holds its
 *                position while filters change; nothing reflows.
 *   FilterSheet  <1024px. A bottom sheet over a scrim, so the results stay
 *                visible behind it and the count updates in view.
 *
 * Both render the same fields — passed in as children by each directory —
 * so there is one set of controls and no second copy to keep in step.
 */

export function FilterRail({ children }: { children: React.ReactNode }) {
  return (
    <aside className="hidden w-[264px] shrink-0 lg:block" aria-label="Filters">
      {/* top-4 clears the sticky page header above it. max-h/overflow so a
          long filter set scrolls inside the rail rather than running off
          the bottom of a short viewport. */}
      <div className="sticky top-4 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[14px] border border-hairline bg-surface p-4">
        <p className="mb-3 text-[13px] font-bold text-ink">Filters</p>
        {children}
      </div>
    </aside>
  );
}

export function FilterSheet({
  open,
  onClose,
  /** Live result count, so the commit button says what dismissing it gets you. */
  resultLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  resultLabel: string;
  children: React.ReactNode;
}) {
  // Escape closes, and the page behind does not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
      {/* Deliberately not opaque: seeing the grid change behind the sheet is
          the whole point of moving off the inline expander. */}
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="relative flex max-h-[80dvh] flex-col rounded-t-2xl border-t border-hairline bg-surface"
      >
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <p className="text-[15px] font-bold text-ink">Filters</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted"
          >
            <i className="ti ti-x text-xl" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {/* Filters apply as they change, so this commits nothing — it
            dismisses the sheet. Labelling it with the live count is what
            makes that honest: you are told what you are going back to. */}
        <div className="border-t border-hairline p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[52px] w-full rounded-[10px] bg-clay-deep text-sm font-semibold text-white"
          >
            {resultLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
