import React from "react";
import { createClient } from "@/lib/supabase/server";
import PageEditorClient from "./PageEditorClient";
import { notFound } from "next/navigation";
import { fetchPublishedArticles } from "@/app/(website)/news/get-news-data";
import {
  fetchPublicationCategories,
  fetchPublishedPublications,
} from "@/app/(website)/publications/get-publications-data";
import {
  fetchProgramCategories,
  fetchPublishedPrograms,
  fetchPublishedSuccessStories,
  fetchPublishedNews,
} from "@/app/(website)/programs/get-programs-data";

export default async function PageEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ section?: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};

  // 1. Fetch Page
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single();

  if (!page) notFound();

  const newsFeedPreview =
    page.slug === "news" ? await fetchPublishedArticles() : null;

  const publicationsFeedPreview =
    page.slug === "publications"
      ? await Promise.all([fetchPublishedPublications(), fetchPublicationCategories()]).then(
          ([publications, categories]) => ({ publications, categories }),
        )
      : null;

  const programsPreview =
    page.slug === "programs"
      ? await Promise.all([
          fetchPublishedPrograms(),
          fetchProgramCategories(),
          fetchPublishedSuccessStories(),
          fetchPublishedNews(),
        ]).then(([programs, categories, successStories, news]) => ({
          programs,
          categories,
          successStories,
          news,
        }))
      : null;

  // 2. Fetch Hero
  const { data: hero } = await supabase
    .from('hero_content')
    .select('*')
    .eq('page_id', id)
    .single();

  // 3. Fetch Sections
  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', id)
    .order('order', { ascending: true });

  // 4. Fetch Slides
  const { data: slides } = await supabase
    .from('slide_items')
    .select('*')
    .eq('page_id', id)
    .order('order', { ascending: true });

  // 5. Fetch Metrics Sections for the metrics page (needed for Impact at a Glance preview)
  const { data: metricsSections } = page.slug === 'metrics'
    ? await (supabase as any)
        .from('metrics_sections')
        .select('*')
        .eq('page_id', id)
        .order('sort_order', { ascending: true })
    : { data: null };

  return (
    <PageEditorClient 
      initialPage={page}
      initialHero={hero || { 
        heading: "", 
        subheading: "", 
        cta_text: "", 
        cta_url: "", 
        image_url: "", 
        options: { align: 'left', overlay_opacity: 0.4 } 
      }}
      initialSections={sections || []}
      initialSlides={slides || []}
      newsFeedPreview={newsFeedPreview}
      publicationsFeedPreview={publicationsFeedPreview}
      programsPreview={programsPreview}
      initialSelectedSectionId={
        typeof sp.section === "string" && sp.section.length ? sp.section : undefined
      }
      initialMetricsSections={metricsSections || []}
    />
  );
}
