import "../website.css";
import "../diocese-map-section.css";
import "../home-about-section.css";
import "../program-tabs-section.css";
import "../resources-impact-section.css";
import "../cta-be-part-section.css";
import "../video-gallery-section.css";
import "../network-section.css";
import "../news-cards-section.css";
import "../partners-section.css";
import "../our-location-section.css";
import "../faq-section.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://caritasrwanda.org'),
  title: {
    default: "Caritas Rwanda | Serving with Faith, Hope & Love",
    template: "%s | Caritas Rwanda",
  },
  description: "Caritas Rwanda empowers communities, provides healthcare, education, and humanitarian assistance, transforming lives across all nine dioceses of Rwanda. Developed by Lerony, an IT Technology and Innovation company.",
  keywords: ["Caritas Rwanda", "NGO Rwanda", "Humanitarian Rwanda", "Catholic Church Rwanda", "Community Development", "Healthcare Rwanda", "Education Rwanda", "Charity", "Lerony", "IT Technology and Innovation"],
  authors: [{ name: "Caritas Rwanda", url: "https://caritasrwanda.org" }, { name: "Lerony", url: "https://lerony.com" }],
  creator: "Lerony",
  publisher: "Caritas Rwanda",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Caritas Rwanda | Serving with Faith, Hope & Love",
    description: "Empowering communities and transforming lives through humanitarian programs across Rwanda. Developed by Lerony.",
    url: "https://caritasrwanda.org",
    siteName: "Caritas Rwanda",
    locale: "en_RW",
    type: "website",
    images: [
      {
        url: '/img/caritas_rwanda_og.webp',
        width: 1200,
        height: 630,
        alt: 'Caritas Rwanda - Serving with Faith, Hope & Love',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Caritas Rwanda",
    description: "Empowering communities and transforming lives through humanitarian programs.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/img/fav.png",
    apple: "/img/fav.png",
    shortcut: "/img/fav.png",
  },
};

import WebsiteHeader from "@/components/website/WebsiteHeader";
import WebsiteFooter from "@/components/website/WebsiteFooter";
import DonationModalWrapper from "@/components/website/DonationModalWrapper";
import VolunteerModalWrapper from "@/components/website/VolunteerModalWrapper";
import EventsWidget from "@/components/website/EventsWidget";
import ChatbotFab from "@/components/website/ChatbotFab";
import CookieConsentBanner from "@/components/website/CookieConsentBanner";
import { DonationProvider } from "@/context/DonationContext";
import { VolunteerProvider } from "@/context/VolunteerContext";
import { getMergedFooterSettings, getCookieConsentSettings } from "@/lib/site-settings";

import { Poppins, Inter, Playfair_Display } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [footerSettings, cookieSettings] = await Promise.all([
    getMergedFooterSettings(),
    getCookieConsentSettings(),
  ]);
  return (
    <VolunteerProvider>
      <DonationProvider>
        <div className={`website-root ${poppins.variable} ${inter.variable} ${playfair.variable}`}>
          <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
          {/* FontAwesome */}
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          />

          <WebsiteHeader />
          <main>{children}</main>
          <WebsiteFooter settings={footerSettings} />

          {cookieSettings && <CookieConsentBanner settings={cookieSettings} />}

          <DonationModalWrapper />
          <VolunteerModalWrapper />
          <EventsWidget />
          <ChatbotFab />
        </div>
      </DonationProvider>
    </VolunteerProvider>
  );
}
