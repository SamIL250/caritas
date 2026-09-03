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
        headlinePrefix={chrome.headlinePrefix}
        headlineAccent={chrome.headlineAccent}
        intro={chrome.intro}
        heroImageUrl={chrome.heroImageUrl}
        pillars={chrome.pillars}
        caption={chrome.departmentsCaption}
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
        <section className="prog-join-section" aria-label="Get Involved">
          <div className="prog-join-section__inner">
            <div className="prog-join-section__shell">
              <div className="prog-join-section__frame">
                <p className="prog-join-section__eyebrow">
                  <i className="fa-solid fa-handshake" aria-hidden />
                  Partner With Us
                </p>
                <h2 className="prog-join-section__title">
                  Join the Mission of<br />Human Dignity
                </h2>
                <p className="prog-join-section__lead">
                  Whether you want to donate, volunteer, or partner with us — every act of solidarity helps Caritas
                  Rwanda reach more families across the country.
                </p>
                <div className="prog-join-section__actions">
                  <button
                    type="button"
                    className="prog-join-section__btn prog-join-section__btn--primary"
                    onClick={() => openModal()}
                  >
                    <i className="fa-solid fa-heart" aria-hidden /> Donate Now
                  </button>
                  <button
                    type="button"
                    className="prog-join-section__btn prog-join-section__btn--secondary"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <i className="fa-solid fa-arrow-up" aria-hidden /> Back to Top
                  </button>
                  <a href="/contact" className="prog-join-section__btn prog-join-section__btn--outline">
                    <i className="fa-solid fa-envelope" aria-hidden />
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
