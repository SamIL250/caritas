"use client";

import type {
  ProgramCategoryRow,
  ProgramRow,
} from "@/lib/programs";
import type { PublicationRow } from "@/lib/publications";
import type { NewsArticleRow } from "@/lib/news";

import ProgramsLandingHero from "@/components/website/programs/ProgramsLandingHero";
import ProgramsLibrary from "@/components/website/programs/ProgramsLibrary";
import ProgramsPartnerSection from "@/components/website/programs/ProgramsPartnerSection";

import type { ProgramsPageChrome, ProgramsCmsSection } from "./get-programs-data";
import {
  parseProgramsLibrarySectionContent,
  parseProgramsPartnerSectionContent,
} from "@/lib/programs-library-section";

import { useDonation } from "@/context/DonationContext";

import "./programs-page.css";

type Props = {
  chrome: ProgramsPageChrome;
  cmsSections: ProgramsCmsSection[];
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
  successStories: PublicationRow[];
  news: NewsArticleRow[];
};

export default function ProgramsPageContent({
  chrome,
  cmsSections,
  programs,
  categories,
  successStories,
  news,
}: Props) {
  const { openModal } = useDonation();

  const librarySection = cmsSections.find((s) => s.type === "programs_library");
  const partnerSection = cmsSections.find(
    (s) => s.type === "cta" && s.section_key === "programs_partner",
  );

  const libraryConfig = parseProgramsLibrarySectionContent(librarySection?.content);
  const partnerConfig = parseProgramsPartnerSectionContent(partnerSection?.content);

  return (
    <div className="prog-page-root">
      <ProgramsLandingHero
        eyebrow={chrome.eyebrow}
        headlinePrefix={chrome.headlinePrefix}
        headlineAccent={chrome.headlineAccent}
        intro={chrome.intro}
        heroImageUrl={chrome.heroImageUrl}
      />

      {!librarySection || librarySection.visible ? (
        <ProgramsLibrary
          programs={programs}
          categories={categories}
          successStories={successStories}
          news={news}
          libraryConfig={libraryConfig}
        />
      ) : null}

      {partnerSection?.visible ? (
        <ProgramsPartnerSection {...partnerConfig} />
      ) : !partnerSection ? (
        <section className="prog-partner-section" aria-label="Get Involved">
          <div className="prog-partner-inner">
            <div className="prog-partner-label">
              <i className="fa-solid fa-handshake" aria-hidden />
              Partner With Us
            </div>
            <h2 className="prog-partner-title">
              Join the Mission of<br />Human Dignity
            </h2>
            <p className="prog-partner-sub">
              Whether you want to donate, volunteer, or partner with us — every act of solidarity helps Caritas
              Rwanda reach more families across the country.
            </p>
            <div className="prog-partner-btns">
              <button
                type="button"
                className="prog-partner-btn-primary"
                onClick={() => openModal()}
              >
                <i className="fa-solid fa-heart" aria-hidden /> Donate Now
              </button>
              <button
                type="button"
                className="prog-partner-btn-primary"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{ background: "#111111" }}
              >
                <i className="fa-solid fa-arrow-up" aria-hidden /> Back to Top
              </button>
              <a href="/contact" className="prog-partner-btn-outline">
                <i className="fa-solid fa-envelope" aria-hidden />
                Contact Us
              </a>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
