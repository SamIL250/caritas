import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prepareStaffRichHtml } from "@/lib/prepare-staff-rich-html";
import { sortTestimonies, type TestimonyRow } from "@/lib/testimonies";
import { TestimonyDetailLayout } from "@/components/website/publications/TestimonyDetailLayout";
import { ViewTracker } from "@/components/website/ViewTracker";
import "../../publications-page.css";
import "../../testimonies-page.css";

type PageProps = { params: Promise<{ slug: string }> };

async function fetchPublishedTestimonyBySlug(slug: string): Promise<TestimonyRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonies")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as TestimonyRow | null) ?? null;
}

async function fetchAllPublishedTestimonies(): Promise<TestimonyRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonies")
    .select("*")
    .eq("status", "published");
  return sortTestimonies((data ?? []) as TestimonyRow[]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const row = await fetchPublishedTestimonyBySlug(slug);
  if (!row) return { title: "Testimony not found — Caritas Rwanda" };
  return {
    title: `${row.title} — Caritas Rwanda`,
    description: row.excerpt || undefined,
  };
}

export default async function TestimonyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [testimony, allTestimonies] = await Promise.all([
    fetchPublishedTestimonyBySlug(slug),
    fetchAllPublishedTestimonies(),
  ]);

  if (!testimony) notFound();

  const bodyHtml = testimony.body?.trim()
    ? await prepareStaffRichHtml(testimony.body.trim())
    : "";

  return (
    <>
      <TestimonyDetailLayout
        testimony={{ ...testimony, body: bodyHtml }}
        allTestimonies={allTestimonies}
      />
      <ViewTracker pageType="publication" pageId={testimony.id} />
    </>
  );
}
