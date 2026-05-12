import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/lib/supabase/server";
import { fetchProgramDepartmentOptions } from "@/lib/program-departments";
import { NewsArticleForm } from "../NewsArticleForm";

export default async function NewStoryPage() {
  const supabase = await createClient();
  const departments = await fetchProgramDepartmentOptions(supabase);

  return (
    <div className="w-full max-w-5xl space-y-6">
      <Topbar title="New story" />
      <p className="text-sm text-stone-500">
        Create a listing for the News page: image, teaser, category, optional full body, and a read-more URL (often an
        external WordPress article).
      </p>
      <NewsArticleForm mode="create" departments={departments} />
    </div>
  );
}
