"use client";

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
  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-30 border-b border-hairline bg-surface/90 px-5 py-3.5 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link href="/" aria-label="Fann home">
            <FannLockup size={20} textClassName="text-[15px]" />
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
