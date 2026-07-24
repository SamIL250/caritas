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
import type { ProgramBubbleDraft } from "@/app/actions/programs";

type Props = {
  sectionContent: unknown;
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
  successStories: PublicationRow[];
  news: NewsArticleRow[];
  programDrafts?: Record<string, ProgramBubbleDraft>;
};

function applyDrafts(
  programs: ProgramRow[],
  drafts: Record<string, ProgramBubbleDraft> | undefined,
): ProgramRow[] {
  if (!drafts || !Object.keys(drafts).length) return programs;
  return programs.map((program) => {
    const draft = drafts[program.id];
    if (!draft) return program;
    return {
      ...program,
      title: draft.title ?? program.title,
      subtitle: draft.subtitle ?? program.subtitle,
      excerpt: draft.excerpt ?? program.excerpt,
      project_period: draft.project_period ?? program.project_period,
      carried_by: draft.carried_by ?? program.carried_by,
      cover_image_url: draft.cover_image_url ?? program.cover_image_url,
    };
  });
}

export default function ProgramsLibrarySectionPreview({
  sectionContent,
  programs,
  categories,
  successStories,
  news,
  programDrafts,
}: Props) {
  const libraryConfig: ProgramsLibrarySectionContent =
    parseProgramsLibrarySectionContent(sectionContent);
  const previewPrograms = applyDrafts(programs, programDrafts);

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
