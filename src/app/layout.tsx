import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from "@/lib/site-config";

export const metadata: Metadata = {
  // Lets every page below give openGraph.images and canonical URLs as plain
  // paths — Next resolves them against this. Without it, relative image
  // paths are dropped from the tags entirely and share cards come out blank.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    // Pages set a bare title; the brand is appended here so there is one
    // place to change it and no page can forget it.
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  // Every one of these links gets pasted into WhatsApp during the cold call
  // sprint, and a link with no preview card reads as broken.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 512, height: 512, alt: SITE_NAME }],
  },
  // Card type only, deliberately. Next merges metadata per key, not per
  // field: a page that sets openGraph but not twitter keeps the root's
  // twitter block wholesale, so a title here would put "Fann — Book
  // Lebanon's live talent" on the Twitter card of every page on the site.
  // With no title, description or image, consumers fall back to the
  // OpenGraph tags, which every page does set correctly.
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#3a2317",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface">
        <ServiceWorkerRegister />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
