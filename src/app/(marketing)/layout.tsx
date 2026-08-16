import { PageBackground } from "@/components/shell/PageBackground";
import { PublicHeader } from "@/components/search/PublicHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

/**
 * One frame for every marketing page.
 *
 * A route group rather than a path segment, so these pages keep clean
 * top-level URLs — /weddings, not /marketing/weddings. The whole group is
 * server-rendered: these exist to be found, and the header and footer are
 * plain link lists with nothing to hydrate.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <PageBackground role="artist" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <PublicHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
    </div>
  );
}
