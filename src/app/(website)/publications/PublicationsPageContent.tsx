"use client";

import { Fragment } from "react";
import type {
  PublicationCategoryRow,
  PublicationRow,
} from "@/lib/publications";
import { renderWebsiteSection } from "@/lib/public-page-sections";

import type { PublicationsCmsSection, PublicationsPageChrome } from "./get-publications-data";
import PublicationsLandingHero from "@/components/website/publications/PublicationsLandingHero";
import PublicationsLibrary from "@/components/website/publications/PublicationsLibrary";

import type { TestimonyRow } from "@/lib/testimonies";

import "./publications-page.css";
import "./testimonies-page.css";

type Props = {
  chrome: PublicationsPageChrome;
  cmsSections: PublicationsCmsSection[];
  publications: PublicationRow[];
  categories: PublicationCategoryRow[];
  testimonies: TestimonyRow[];
};

export default function PublicationsPageContent({
  chrome,
  cmsSections,
  publications,
  categories,
  testimonies,
}: Props) {
  return (
    <div className="pub-page-root">
      <PublicationsLandingHero
        eyebrow={chrome.eyebrow}
        headlinePrefix={chrome.headlinePrefix || "Publications &"}
        headlineAccent={chrome.headlineAccent || "Resources"}
        intro={chrome.intro}
      />

      {cmsSections.map((section) => {
        if (!section.visible) return null;

        if (section.type === "publications_library") {
          return (
            <PublicationsLibrary
              key={section.id}
              publications={publications}
              categories={categories}
              testimonies={testimonies}
            />
          );
        }

        return (
          <Fragment key={section.id}>{renderWebsiteSection(section)}</Fragment>
        );
      })}
    </div>
  );
}
