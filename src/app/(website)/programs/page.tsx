import type { Metadata } from "next";
import ProgramsPageContent from "./ProgramsPageContent";
import { resolveProgramsPublicPagePayload } from "./get-programs-data";

export async function generateMetadata(): Promise<Metadata> {
  const { seoTitle, seoDescription } = await resolveProgramsPublicPagePayload();
  return {
    title: seoTitle,
    description: seoDescription,
  };
}

export default async function ProgramsPage() {
  const { chrome, cmsSections, programs, categories, successStories, news } =
    await resolveProgramsPublicPagePayload();
  return (
    <ProgramsPageContent
      chrome={chrome}
      cmsSections={cmsSections}
      programs={programs}
      categories={categories}
      successStories={successStories}
      news={news}
    />
  );
}
