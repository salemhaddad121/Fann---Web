import { STORE_BADGES } from "@/lib/site-links";

/**
 * App Store / Google Play badges.
 *
 * Neither app exists yet, so the badges render as inert with a "coming
 * soon" label rather than as links. The spec asks for the badges; showing
 * them as working links to nothing would be a promise the product cannot
 * keep, and a store badge that 404s is worse than no badge.
 *
 * When the apps ship, set `href` in site-links.ts and they become links —
 * no change here.
 */
export function StoreBadges({ heading }: { heading?: string }) {
  const anyLive = STORE_BADGES.some((badge) => badge.href);

  return (
    <div>
      {heading && (
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-ink">
          {heading}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {STORE_BADGES.map((badge) => {
          const content = (
            <>
              <i className={`ti ti-${badge.icon} text-[22px]`} aria-hidden />
              <span className="text-left leading-tight">
                <span className="block text-[10px] text-faint">{badge.label}</span>
                <span className="block text-[13px] font-semibold">{badge.sublabel}</span>
              </span>
            </>
          );

          const className =
            "flex items-center gap-2.5 rounded-[10px] border border-hairline px-3.5 py-2";

          return badge.href ? (
            <a
              key={badge.sublabel}
              href={badge.href}
              target="_blank"
              rel="noreferrer noopener"
              className={`${className} bg-surface text-ink hover:opacity-90`}
            >
              {content}
            </a>
          ) : (
            <span
              key={badge.sublabel}
              className={`${className} bg-surface/60 text-faint`}
            >
              {content}
            </span>
          );
        })}

        {!anyLive && (
          <span className="text-xs text-faint">Mobile apps coming soon.</span>
        )}
      </div>
    </div>
  );
}
