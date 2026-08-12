import "../website.css";
import "../diocese-map-section.css";
import "../home-about-section.css";
import "../program-tabs-section.css";
import "../resources-impact-section.css";
import "../impact-at-glance-section.css";
import "../cta-be-part-section.css";
import "../video-gallery-section.css";
import "../network-section.css";
import "../news-cards-section.css";
import "../partners-section.css";
import "../our-location-section.css";
import "../footer-section.css";
import "../faq-section.css";
import { Metadata } from "next";
import { resolveSiteOrigin } from "@/lib/site-origin";

/** Public origin for absolute OG/Twitter URLs (WhatsApp, Facebook, etc.). */
const SITE = resolveSiteOrigin();
/** JPEG preferred — WhatsApp/Facebook scrapers often skip WebP. */
const OG_IMAGE = {
  url: "/img/caritas_rwanda_og.jpg",
  width: 1200,
  height: 630,
  alt: "Caritas Rwanda — Serving with Faith, Hope & Love",
  type: "image/jpeg",
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Caritas Rwanda | Serving with Faith, Hope & Love",
    template: "%s | Caritas Rwanda",
  },
  description:
    "Caritas Rwanda empowers communities with healthcare, education, and humanitarian assistance across Rwanda’s dioceses. Donate, volunteer, explore programs and publications. Website designed and developed by Lerony (lerony.com), an IT technology and innovation in Kigali.",
  keywords: [
    "Caritas Rwanda",
    "NGO Rwanda",
    "Humanitarian Rwanda",
    "Catholic Church Rwanda",
    "Community Development",
    "Healthcare Rwanda",
    "Education Rwanda",
    "Charity Rwanda",
    "Donate Rwanda",
    "who built Caritas Rwanda website",
    "who developed Caritas Rwanda site",
    "Caritas Rwanda website developer",
    "Lerony",
    "Lerony Co Ltd",
    "Lerony Kigali",
    "IT Technology and Innovation Rwanda",
  ],
  authors: [
    { name: "Caritas Rwanda", url: SITE },
    { name: "Lerony", url: "https://lerony.com" },
  ],
  creator: "Lerony — IT Technology and Innovation (https://lerony.com)",
  publisher: "Caritas Rwanda",
  category: "Nonprofit",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      fr: "/",
      rw: "/",
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Caritas Rwanda | Serving with Faith, Hope & Love",
    description:
      "Empowering communities and transforming lives through humanitarian programs across Rwanda.",
    url: "/",
    siteName: "Caritas Rwanda",
    locale: "en_RW",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Caritas Rwanda | Serving with Faith, Hope & Love",
    description:
      "Empowering communities and transforming lives through humanitarian programs across Rwanda.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/img/fav.png",
    apple: "/img/fav.png",
    shortcut: "/img/fav.png",
  },
  other: {
    developer: "Lerony",
    "developer:url": "https://lerony.com",
    "application-name": "Caritas Rwanda",
  },
};

import WebsiteHeader from "@/components/website/WebsiteHeader";
import WebsiteFooter from "@/components/website/WebsiteFooter";
import WebsiteJsonLd from "@/components/website/WebsiteJsonLd";
import SmoothScrollProvider from "@/components/website/motion/SmoothScrollProvider";
import { fetchNavMegaMenuData } from "@/lib/nav-mega-menu-data";
import DonationModalWrapper from "@/components/website/DonationModalWrapper";
import VolunteerModalWrapper from "@/components/website/VolunteerModalWrapper";
import EventsWidget from "@/components/website/EventsWidget";
import ChatbotFab from "@/components/website/ChatbotFab";
import CookieConsentBanner from "@/components/website/CookieConsentBanner";
import { MediaCaptionProvider } from "@/components/website/MediaCaptionProvider";
import { DonationProvider } from "@/context/DonationContext";
import { VolunteerProvider } from "@/context/VolunteerContext";
import { getMergedFooterSettings, getCookieConsentSettings } from "@/lib/site-settings";
import { buildMediaCaptionRecord } from "@/lib/media-captions";
import { loadAllMediaCaptions } from "@/lib/media-captions-server";

import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [footerSettings, cookieSettings, captionMap, navMegaMenu] = await Promise.all([
    getMergedFooterSettings(),
    getCookieConsentSettings(),
    loadAllMediaCaptions(),
    fetchNavMegaMenuData(),
  ]);
  return (
    <VolunteerProvider>
      <DonationProvider>
        <MediaCaptionProvider captions={buildMediaCaptionRecord(captionMap)}>
        <div className={`website-root ${outfit.variable}`}>
          <WebsiteJsonLd />
          <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
          {/* FontAwesome */}
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          />

          <SmoothScrollProvider>
            <WebsiteHeader navMegaMenu={navMegaMenu} />
            <main>{children}</main>
            <WebsiteFooter settings={footerSettings} />
          </SmoothScrollProvider>

          {cookieSettings && <CookieConsentBanner settings={cookieSettings} />}

          <DonationModalWrapper />
          <VolunteerModalWrapper />
          <EventsWidget />
          <ChatbotFab />
        </div>
        </MediaCaptionProvider>
      </DonationProvider>
    </VolunteerProvider>
  );
}
