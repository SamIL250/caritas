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
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Caritas Rwanda | Serving with Faith, Hope & Love",
    template: "%s | Caritas Rwanda",
  },
  description: "Caritas Rwanda empowers communities, provides healthcare, education, and humanitarian assistance, transforming lives across all nine dioceses of Rwanda.",
  keywords: ["Caritas Rwanda", "NGO Rwanda", "Humanitarian Rwanda", "Catholic Church Rwanda", "Community Development", "Healthcare Rwanda", "Education Rwanda", "Charity", "Lerony"],
  authors: [{ name: "Caritas Rwanda" }, { name: "Lerony", url: "https://lerony.com" }],
  creator: "Lerony",
  publisher: "Caritas Rwanda",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Caritas Rwanda | Serving with Faith, Hope & Love",
    description: "Empowering communities and transforming lives through humanitarian programs across Rwanda.",
    url: "https://caritasrwanda.org",
    siteName: "Caritas Rwanda",
    locale: "en_RW",
    type: "website",
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
};

import WebsiteHeader from "@/components/website/WebsiteHeader";
import WebsiteFooter from "@/components/website/WebsiteFooter";
import DonationModalWrapper from "@/components/website/DonationModalWrapper";
import VolunteerModalWrapper from "@/components/website/VolunteerModalWrapper";
import EventsFab from "@/components/website/EventsFab";
import ChatbotFab from "@/components/website/ChatbotFab";
import { DonationProvider } from "@/context/DonationContext";
import { VolunteerProvider } from "@/context/VolunteerContext";
import { getMergedFooterSettings } from "@/lib/site-settings";

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
  const footerSettings = await getMergedFooterSettings();
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

          <DonationModalWrapper />
          <VolunteerModalWrapper />
          <EventsFab />
          <ChatbotFab />
        </div>
      </DonationProvider>
    </VolunteerProvider>
  );
}
