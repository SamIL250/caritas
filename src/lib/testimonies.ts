import { sortByPublishedNewest } from "@/lib/content-sort";
import { encodePublicationAssetUrl } from "@/lib/publications";

export type TestimonyStatus = "draft" | "published";

export type TestimonyRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  cover_image_alt: string;
  status: TestimonyStatus;
  published_at: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const TESTIMONIES_SECTION_ANCHOR = "testimonies";

export function testimonyDetailHref(row: Pick<TestimonyRow, "slug">): string {
  return `/publications/testimonies/${row.slug}`;
}

export function encodeTestimonyAssetUrl(url: string): string {
  return encodePublicationAssetUrl(url);
}

export function sortTestimonies<T extends Pick<TestimonyRow, "published_at" | "created_at" | "title">>(
  rows: T[],
): T[] {
  return sortByPublishedNewest(rows);
}
