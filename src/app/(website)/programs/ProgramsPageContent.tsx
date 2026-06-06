"use client";

import type {
  ProgramCategoryRow,
  ProgramRow,
} from "@/lib/programs";
import type { PublicationRow } from "@/lib/publications";
import type { NewsArticleRow } from "@/lib/news";

import ProgramsLandingHero from "@/components/website/programs/ProgramsLandingHero";
import ProgramsLibrary from "@/components/website/programs/ProgramsLibrary";

import type { ProgramsPageChrome } from "./get-programs-data";

import { useDonation } from "@/context/DonationContext";

import "./programs-page.css";

type Props = {
  chrome: ProgramsPageChrome;
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
  successStories: PublicationRow[];
  news: NewsArticleRow[];
};

export default function ProgramsPageContent({ chrome, programs, categories, successStories, news }: Props) {
  const { openModal } = useDonation();

  return (
    <div className="prog-page-root">
      <ProgramsLandingHero
        eyebrow={chrome.eyebrow}
        headlinePrefix={chrome.headlinePrefix}
        headlineAccent={chrome.headlineAccent}
        intro={chrome.intro}
      />
      <ProgramsLibrary
        programs={programs}
        categories={categories}
        successStories={successStories}
        news={news}
      />

      {/* ── Partner With Us ── */}
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
              onClick={openModal}
            >
              Donate Now
            </button>
            <a href="/contact" className="prog-partner-btn-outline">
              <i className="fa-solid fa-envelope" aria-hidden />
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
