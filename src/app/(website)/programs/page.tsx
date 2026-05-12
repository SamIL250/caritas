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
  const { chrome, programs, categories } = await resolveProgramsPublicPagePayload();
  return (
    <ProgramsPageContent
      chrome={chrome}
      programs={programs}
      categories={categories}
    />
  );
}
