import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProgramDepartmentOptions } from "@/lib/program-departments";
import { Topbar } from "@/components/layout/Topbar";
import { Copy } from "lucide-react";
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
    <div className="w-full max-w-full space-y-6">
      <Topbar title="Edit story" backUrl="/dashboard/news" />
      <div className="flex justify-end">
        <Link
          href={`/dashboard/news/new?duplicate=${article.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#7A1515]"
        >
          <Copy size={13} aria-hidden />
          Duplicate this story
        </Link>
      </div>
      <NewsArticleForm mode="edit" article={article} departments={departments} />
    </div>
  );
}
