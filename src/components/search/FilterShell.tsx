"use client";

import { useEffect, useRef } from "react";

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
      {/* Pins 16px below whatever sticky header the surrounding shell has.
          --sticky-header-h is 0 by default and set by GuestChrome, whose
          header is sticky at every width — this previously pinned at a flat
          16px, which put the card's top edge and its "Filters" heading
          underneath that bar for every signed-out visitor on desktop. Not
          solvable with z-index: painting the rail OVER the header is worse
          than under it. max-h/overflow so a long filter set scrolls inside
          the rail rather than running off a short viewport. */}
      <div className="sticky top-[calc(var(--sticky-header-h,0px)+1rem)] max-h-[calc(100dvh-var(--sticky-header-h,0px)-2rem)] overflow-y-auto rounded-[14px] border border-hairline bg-surface p-4">
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
  /**
   * Which role's accent the commit button wears. Both directories mount
   * this same component, and it used to hardcode clay — so the planner
   * directory, which is teal in its chips, its badge, its focus rings and
   * its empty-state CTA, had one clay button in the middle of it. Same
   * prop and same two values as ResultBar, deliberately.
   */
  accent,
  children,
}: {
  open: boolean;
  onClose: () => void;
  resultLabel: string;
  accent: "clay" | "teal";
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);
  /*
   * Escape closes, the page behind does not scroll, and focus is actually
   * confined to the panel.
   *
   * The last part is not optional: this declares aria-modal="true", which
   * tells assistive tech everything outside is inert. Without a trap that
   * was a lie — Tab walked straight out into the search box, the chips and
   * the result cards still sitting behind the scrim, while a screen reader
   * insisted they were not there.
   */
  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement;
    // Focus the panel itself rather than the first control, so a screen
    // reader announces the dialog before its fields.
    panelRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Wrap at both ends, and pull focus back in if it has escaped (the
      // panel is focusable itself, so the first Tab from it lands on first).
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      // Back where it came from, so dismissing does not dump focus at the
      // top of the document.
      (openerRef.current as HTMLElement | null)?.focus?.();
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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        tabIndex={-1}
        className="relative flex max-h-[80dvh] flex-col rounded-t-2xl border-t border-hairline bg-surface outline-none"
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
            className={`h-[52px] w-full rounded-[10px] text-sm font-semibold text-white ${
              accent === "teal" ? "bg-teal" : "bg-clay-deep"
            }`}
          >
            {resultLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
