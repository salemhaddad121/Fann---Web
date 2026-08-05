const PLATFORM_STYLES: Record<string, { icon: string; bg: string; label: string }> = {
  instagram: { icon: "ti-brand-instagram", bg: "linear-gradient(135deg,#F9CE34,#EE2A7B,#6228D7)", label: "Instagram" },
  youtube: { icon: "ti-brand-youtube", bg: "#FF0000", label: "YouTube" },
  spotify: { icon: "ti-brand-spotify", bg: "#1DB954", label: "Spotify" },
  tiktok: { icon: "ti-brand-tiktok", bg: "#000000", label: "TikTok" },
  facebook: { icon: "ti-brand-facebook", bg: "#1877F2", label: "Facebook" },
  linkedin: { icon: "ti-brand-linkedin", bg: "#0077B5", label: "LinkedIn" },
  twitter: { icon: "ti-brand-x", bg: "#000000", label: "X" },
  website: { icon: "ti-world", bg: "#8a7360", label: "Website" },
};

function displayHandle(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.pathname.replace(/^\/+|\/+$/g, "") || u.hostname;
  } catch {
    return url;
  }
}

export function SocialLinks({ links }: { links: Record<string, string> | null | undefined }) {
  const entries = Object.entries(links ?? {}).filter(([, url]) => !!url);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map(([platform, url]) => {
        const style = PLATFORM_STYLES[platform.toLowerCase()] ?? {
          icon: "ti-link",
          bg: "#8a7360",
          label: platform,
        };
        return (
          <a
            key={platform}
            href={url.startsWith("http") ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2.5 bg-surface border border-hairline rounded-xl"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: style.bg }}
            >
              <i className={`ti ${style.icon} text-white text-base`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-ink">{style.label}</div>
              <div className="text-[11px] text-faint truncate">{displayHandle(url)}</div>
            </div>
            <i className="ti ti-chevron-right text-xs text-faint" />
          </a>
        );
      })}
    </div>
  );
}
