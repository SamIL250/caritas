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

export function sortTestimonies<T extends Pick<TestimonyRow, "sort_order" | "published_at" | "title">>(
  rows: T[],
): T[] {
  return [...rows].sort((a, b) => {
    const order = a.sort_order - b.sort_order;
    if (order !== 0) return order;
    const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
    if (bTime !== aTime) return bTime - aTime;
    return a.title.localeCompare(b.title);
  });
}
