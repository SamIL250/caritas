import React from "react";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/lib/supabase/server";
import { fetchProgramDepartmentOptions } from "@/lib/program-departments";
import type { NewsArticleRow } from "@/lib/news";
import { NewsArticleForm } from "../NewsArticleForm";

type Props = {
  searchParams?: Promise<{ duplicate?: string }>;
};

export default async function NewStoryPage({ searchParams }: Props) {
  let duplicateFrom: NewsArticleRow | null = null;

  if (searchParams) {
    const params = await searchParams;
    if (params?.duplicate) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("news_articles")
        .select("*")
        .eq("id", params.duplicate)
        .maybeSingle();
      if (!data) notFound();
      duplicateFrom = data as NewsArticleRow;
    }
  }

  const supabase = await createClient();
  const departments = await fetchProgramDepartmentOptions(supabase);

  return (
    <div className="w-full max-w-full space-y-6">
      <Topbar
        title={duplicateFrom ? "Duplicate story" : "New story"}
        backUrl="/dashboard/news"
      />
      <p className="text-sm text-stone-500">
        {duplicateFrom
          ? `Pre-filled from "${duplicateFrom.title}". Change what you need and save.`
          : "Create a listing for the News page: image, teaser, category, optional full body, and a read-more URL (often an external WordPress article)."}
      </p>
      <NewsArticleForm mode="create" departments={departments} duplicateFrom={duplicateFrom} />
    </div>
  );
}
