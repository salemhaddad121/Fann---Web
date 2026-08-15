import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { RedirectIfAuthed } from "@/components/landing/RedirectIfAuthed";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/site-config";

/**
 * Rebuilt hourly so the category and event-type pills follow the taxonomy
 * without a redeploy. Nothing else on the page is dynamic, and the session
 * check that used to make this page client-only now lives in a child.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  // The one page that should rank for the brand name itself, so the title
  // leads with it rather than appending it. Set absolute to opt out of the
  // root layout's "%s — Fann" template, which would otherwise double it.
  title: { absolute: `Fann — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function RootPage() {
  return (
    <>
      <OrganizationJsonLd />
      <RedirectIfAuthed />
      <LandingPage />
    </>
  );
}
