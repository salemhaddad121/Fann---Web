import Link from "next/link";
import { ReactNode } from "react";
import { Waveform } from "@/components/auth/Waveform";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel — hidden on small screens to keep mobile focused on the form */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12 relative overflow-hidden">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight z-10">
          ayn<span className="text-[#93ADE8]">u</span>
        </Link>

        <div className="z-10 max-w-sm">
          <p className="font-display text-3xl font-medium leading-tight mb-4">
            Book Lebanon&apos;s live talent, without the group chat chaos.
          </p>
          <p className="text-[#93ADE8] text-sm leading-relaxed">
            DJs, bands, photographers and MCs — searchable, available, and
            bookable in one place.
          </p>
        </div>

        <Waveform className="absolute bottom-0 right-0 opacity-90" />
        <p className="z-10 text-xs text-[#6B84C4]">© {new Date().getFullYear()} Aynu</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 font-display text-xl font-bold text-ink">
            ayn<span className="text-indigo">u</span>
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
