"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FannLockup } from "@/components/brand/FannMark";

/**
 * Page frame for a signed-out visitor.
 *
 * AppShell cannot be reused here: it derives the nav items and the unread
 * badges from a role, and a guest has none. Rather than feed it a stub user
 * and then suppress half of what it renders, browsing pages get this much
 * smaller frame — a way home, a way back to search, and a way to sign in.
 *
 * Used by /search and /artists/[id], the two pages a guest can now reach.
 */
export function GuestChrome({
  children,
  showSearchLink = true,
}: {
  children: React.ReactNode;
  showSearchLink?: boolean;
}) {
  /*
   * --sticky-header-h tells anything pinning inside this shell how far down
   * to start. The header below is sticky at EVERY width (unlike AppShell's
   * TopNav, which is lg:hidden), so a child pinning at top-0 sits under it —
   * that is what put the search filter rail's heading behind this bar once
   * already.
   *
   * MEASURED, not hardcoded. It was 65px, derived by hand from the padding
   * plus the Sign in button. Then the wordmark went to 40px, the lockup
   * became the tallest thing in the row, the header grew to 69px, and the
   * number was silently wrong again. It would also be wrong at any width
   * where the nav wraps. So the header reports its own height instead.
   */
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState<number | null>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setHeaderH(Math.round(entry.contentRect.height + 1)); // +1 for the border
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-dvh bg-paper"
      // Falls back to 69px for the server render and the first paint, which
      // is the current desktop height — so the rail is right immediately and
      // the observer only corrects it if the header is actually a different
      // size.
      style={{ "--sticky-header-h": `${headerH ?? 69}px` } as React.CSSProperties}
    >
      <header
        ref={headerRef}
        className="sticky top-0 z-30 border-b border-hairline bg-surface/90 px-5 py-3.5 backdrop-blur"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link href="/" aria-label="Fann home">
            <FannLockup size={40} />
          </Link>
          <nav className="flex items-center gap-4">
            {showSearchLink && (
              <Link href="/search" className="text-sm font-semibold text-muted">
                Search
              </Link>
            )}
            <Link href="/plans" className="text-sm font-semibold text-muted">
              Plans
            </Link>
            <Link href="/help" className="text-sm font-semibold text-muted">
              Help
            </Link>
            <Link
              href="/auth/login"
              className="rounded-[10px] bg-clay-deep px-3.5 py-2 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
