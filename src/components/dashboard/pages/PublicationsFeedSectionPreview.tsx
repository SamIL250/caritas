"use client";

import Link from "next/link";
import "@/app/(website)/publications/publications-page.css";
import "@/app/(website)/publications/testimonies-page.css";
import PublicationsLibrary from "@/components/website/publications/PublicationsLibrary";
import type { PublicationCategoryRow, PublicationRow } from "@/lib/publications";
import type { TestimonyRow } from "@/lib/testimonies";

type Props = {
  publications: PublicationRow[];
  categories: PublicationCategoryRow[];
  testimonies?: TestimonyRow[];
};

export default function PublicationsFeedSectionPreview({
  publications,
  categories,
  testimonies = [],
}: Props) {
  if (!publications.length && !testimonies.length) {
    return (
      <div className="flex min-h-[min(20rem,50vh)] w-full flex-col items-center justify-center gap-3 px-4 py-10 text-center">
        <p className="text-sm font-semibold text-[#0d1b2a]">No published publications yet</p>
        <p className="max-w-sm text-xs leading-relaxed text-[#5a6a7a]">
          Add PDFs, stories, and testimonies under Dashboard → Publications. They appear here and on{" "}
          <span className="whitespace-nowrap">/publications</span>.
        </p>
        <Link
          href="/dashboard/publications"
          className="mt-2 inline-flex text-xs font-semibold text-[#a5280d] hover:underline"
        >
          Open Publications →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <PublicationsLibrary
        publications={publications}
        categories={categories}
        testimonies={testimonies}
      />
    </div>
  );
}
