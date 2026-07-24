"use client";

import Link from "next/link";
import "@/app/(website)/programs/programs-page.css";
import ProgramsLibrary from "@/components/website/programs/ProgramsLibrary";
import type { ProgramCategoryRow, ProgramRow } from "@/lib/programs";
import type { PublicationRow } from "@/lib/publications";
import type { NewsArticleRow } from "@/lib/news";
import {
  parseProgramsLibrarySectionContent,
  type ProgramsLibrarySectionContent,
} from "@/lib/programs-library-section";
type Props = {
  sectionContent: unknown;
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
  successStories: PublicationRow[];
  news: NewsArticleRow[];
};

export default function ProgramsLibrarySectionPreview({
  sectionContent,
  programs,
  categories,
  successStories,
  news,
}: Props) {
  const libraryConfig: ProgramsLibrarySectionContent =
    parseProgramsLibrarySectionContent(sectionContent);
  const previewPrograms = programs;

  if (!previewPrograms.length) {
    return (
      <div className="flex min-h-[min(20rem,50vh)] w-full flex-col items-center justify-center gap-3 px-4 py-10 text-center">
        <p className="text-sm font-semibold text-[#0d1b2a]">No published programs yet</p>
        <p className="max-w-sm text-xs leading-relaxed text-[#5a6a7a]">
          Add programs under Dashboard → Programs. They appear in the map circles on{" "}
          <span className="whitespace-nowrap">/programs</span>.
        </p>
        <Link
          href="/dashboard/programs"
          className="mt-2 inline-flex text-xs font-semibold text-[#a5280d] hover:underline"
        >
          Open Programs →
        </Link>
      </div>
    );
  }

  return (
    <div className="prog-page-root w-full min-w-0">
      <ProgramsLibrary
        programs={previewPrograms}
        categories={categories}
        successStories={successStories}
        news={news}
        libraryConfig={libraryConfig}
      />
    </div>
  );
}
