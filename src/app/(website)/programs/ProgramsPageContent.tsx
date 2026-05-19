"use client";

import type {
  ProgramCategoryRow,
  ProgramRow,
} from "@/lib/programs";
import type { PublicationRow } from "@/lib/publications";

import ProgramsLandingHero from "@/components/website/programs/ProgramsLandingHero";
import ProgramsLibrary from "@/components/website/programs/ProgramsLibrary";

import type { ProgramsPageChrome } from "./get-programs-data";

import "./programs-page.css";

type Props = {
  chrome: ProgramsPageChrome;
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
  successStories: PublicationRow[];
};

export default function ProgramsPageContent({ chrome, programs, categories, successStories }: Props) {
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
      />
    </div>
  );
}
