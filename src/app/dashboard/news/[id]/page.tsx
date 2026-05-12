import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProgramDepartmentOptions } from "@/lib/program-departments";
import { Topbar } from "@/components/layout/Topbar";
import type { Database } from "@/types/database.types";
import { NewsArticleForm } from "../NewsArticleForm";

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, departments] = await Promise.all([
    supabase.from("news_articles").select("*").eq("id", id).maybeSingle(),
    fetchProgramDepartmentOptions(supabase),
  ]);

  const article = data as Database["public"]["Tables"]["news_articles"]["Row"] | null;
  if (!article) notFound();

  return (
    <div className="w-full max-w-5xl space-y-6">
      <Topbar title="Edit story" />
      <NewsArticleForm mode="edit" article={article} departments={departments} />
    </div>
  );
}
