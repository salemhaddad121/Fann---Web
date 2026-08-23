import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LandingPage } from "@/components/landing/LandingPage";
import { RedirectIfAuthed } from "@/components/landing/RedirectIfAuthed";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/site-config";
import { TWA_FLAG, TWA_PARAM, TWA_PARAM_VALUE } from "@/lib/twa-context";

export const metadata: Metadata = {
  // The one page that should rank for the brand name itself, so the title
  // leads with it rather than appending it. Set absolute to opt out of the
  // root layout's "%s — Fann" template, which would otherwise double it.
  title: { absolute: `Fann — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

/**
 * Now that the page carries prices, it decides on the server whether it is
 * the app — same call /plans makes, and for the same reason: deciding on the
 * client would put the prices in the HTML and then take them away again,
 * which is a flash of exactly what Play's billing policy is about.
 *
 * That costs the route its `revalidate = 3600`; reading a cookie makes it
 * dynamic. The hourly refresh moved down to the data instead, so the API
 * load is unchanged — see the unstable_cache calls in LandingPage and
 * LandingPlans.
 *
 * The search param is checked as well as the cookie, and it is not
 * redundant. This page is the app's start URL, so it is the one screen the
 * app reaches *before* TwaContextProbe has had a chance to set the cookie —
 * on a cold launch the marker in the URL is the only evidence there is.
 */
export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [cookieStore, params] = await Promise.all([cookies(), searchParams]);
  const inApp = cookieStore.has(TWA_FLAG) || params[TWA_PARAM] === TWA_PARAM_VALUE;

  return (
    <>
      <OrganizationJsonLd />
      <RedirectIfAuthed />
      <LandingPage showPricing={!inApp} />
    </>
  );
}
