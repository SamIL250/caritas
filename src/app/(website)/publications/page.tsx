import type { Metadata } from "next";
import PublicationsPageContent from "./PublicationsPageContent";
import { resolvePublicationsPublicPagePayload } from "./get-publications-data";

export async function generateMetadata(): Promise<Metadata> {
  const { seoTitle, seoDescription } = await resolvePublicationsPublicPagePayload();

  return {
    title: seoTitle,
    description: seoDescription,
  };
}

export default async function PublicationsPage() {
  const { chrome, cmsSections, publications, categories } =
    await resolvePublicationsPublicPagePayload();

  return (
    <PublicationsPageContent
      chrome={chrome}
      cmsSections={cmsSections}
      publications={publications}
      categories={categories}
    />
  );
}
