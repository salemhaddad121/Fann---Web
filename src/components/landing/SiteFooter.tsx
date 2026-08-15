import Link from "next/link";
import { FannLockup } from "@/components/brand/FannMark";
import {
  FOOTER_COLUMNS,
  LEGAL_LINKS,
  SOCIAL_LINKS,
  type SiteLink,
} from "@/lib/site-links";
import { StoreBadges } from "@/components/landing/StoreBadges";

/**
 * Renders a link, or plain text when the destination does not exist yet.
 *
 * Unbuilt pages are deliberately not linked. A footer full of links to 404s
 * reads as a broken site, where the same labels as plain text read as a
 * sitemap of what is coming.
 */
function FooterLink({ link }: { link: SiteLink }) {
  if (!link.href) {
    return <span className="text-sm text-faint">{link.label}</span>;
  }
  return (
    <Link href={link.href} className="text-sm text-ink-soft hover:text-clay-deep">
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-surface/85">
      <div className="mx-auto max-w-6xl px-5 py-10">
        {/* Six columns is a lot for a phone, so they stack in two and open
            out at lg — matching the sidebar breakpoint used elsewhere. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-ink">
                {column.heading}
              </p>
              <ul className="space-y-1.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-hairline pt-6">
          <StoreBadges />
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-hairline pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <FannLockup size={20} textClassName="text-[15px]" />
            <p className="mt-1.5 text-xs text-faint">
              Connecting artists and event planners across Lebanon.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) =>
              social.href ? (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-ink-soft hover:text-clay-deep"
                >
                  <i className={`ti ti-${social.icon} text-[19px]`} aria-hidden />
                </a>
              ) : (
                // No account yet. Rendered but inert, and hidden from
                // screen readers rather than announced as a dead control.
                <span key={social.label} aria-hidden className="text-hairline">
                  <i className={`ti ti-${social.icon} text-[19px]`} />
                </span>
              ),
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          {LEGAL_LINKS.map((link) => (
            <FooterLink key={link.label} link={link} />
          ))}
          <span className="text-xs text-faint lg:ml-auto">
            © {new Date().getFullYear()} Fann
          </span>
        </div>
      </div>
    </footer>
  );
}
