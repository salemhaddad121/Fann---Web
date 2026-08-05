import Link from "next/link";
import { ReactNode } from "react";
import { Waveform } from "@/components/auth/Waveform";
import { FannLockup } from "@/components/brand/FannMark";
import { ArabesqueMotif } from "@/components/brand/ArabesqueMotif";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  background = "artist",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  // Which side's copy and line-art accent show in the brand panel below.
  // Defaults to artist for pages with no notion of role yet (login,
  // forgot-password, etc.) — register.tsx passes this dynamically based on
  // its role toggle.
  background?: "artist" | "planner";
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel — hidden on small screens to keep mobile focused on the
          form. Maqam turns this from a dark photographic wash into warm paper
          with line art, which removes the contrast problem the old panel had:
          there is no longer any light-text-over-busy-artwork to defend, since
          everything here is now dark ink on a light ground. */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-12 bg-sand-deep text-ink">
        <ArabesqueMotif role={background} className="absolute inset-0 w-full h-full" opacity={0.5} />

        <Link href="/" className="relative z-10 w-fit">
          <FannLockup size={30} withDots textClassName="text-2xl" />
        </Link>

        <div className="relative z-10 max-w-sm">
          <p className="font-display text-3xl font-bold leading-tight mb-4">
            {background === "planner"
              ? "Search and Manage all your live talent needs in one place"
              : "Promote yourself to all event organizers"}
          </p>
          <p className="text-ink-soft text-sm leading-relaxed">
            {background === "planner"
              ? "DJs, bands, photographers, hosts and much more — searchable, available, and bookable in one place."
              : "Event Planners, Venues, Restaurants, Wedding Planners and much more all in one place."}
          </p>
          {/* Sits directly under the tagline at the design's 14px gap, the
              same placement the concept card gives it. */}
          <Waveform height={16} className="mt-3.5" />
        </div>

        <p className="relative z-10 text-xs text-ink-soft">© {new Date().getFullYear()} Fann</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-10 bg-surface">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <FannLockup size={24} textClassName="text-xl" />
          </div>

          <h1 className="font-display text-2xl font-bold text-ink mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-muted mb-6">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}

          {children}

          {footer && <div className="mt-6 text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
