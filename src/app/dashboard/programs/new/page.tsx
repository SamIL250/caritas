import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { ProgramCategoryRow } from "@/lib/programs";
import ProgramForm from "../ProgramForm";

type PageProps = { searchParams?: Promise<{ category?: string | string[] }> };

function takeCategory(raw: string | string[] | undefined): string | null {
  if (!raw) return null;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v?.trim() || null;
}

export default async function NewProgramPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const initialCategorySlug = takeCategory(params.category);

  const supabase = await createClient();
  const { data: catRows } = await supabase
    .from("program_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  const categories = (catRows ?? []) as ProgramCategoryRow[];

  return (
    <div className="w-full max-w-5xl">
      <Topbar
        title="New program"
        subtitle="Write a program article — pick a category, add a cover and tell the story."
      />
      <ProgramForm
        mode="create"
        categories={categories}
        initialCategorySlug={initialCategorySlug}
      />
    </div>
  );
}
