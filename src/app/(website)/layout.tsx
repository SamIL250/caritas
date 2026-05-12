import "../website.css";
import "../diocese-map-section.css";
import "../home-about-section.css";
import "../program-tabs-section.css";
import "../resources-impact-section.css";
import "../cta-be-part-section.css";
import "../video-gallery-section.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Caritas Rwanda",
  description: "Empowering communities and transforming lives through humanitarian programs.",
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

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const footerSettings = await getMergedFooterSettings();
  return (
    <VolunteerProvider>
      <DonationProvider>
        <div className="website-root">
          {/* FontAwesome */}
          <link 
            rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          />
          {/* Poppins and Inter Fonts */}
          <link 
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" 
            rel="stylesheet" 
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
