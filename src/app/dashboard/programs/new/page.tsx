import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { ProgramCategoryRow, ProgramRow } from "@/lib/programs";
import ProgramForm from "../ProgramForm";

type PageProps = {
  searchParams?: Promise<{ category?: string | string[]; duplicate?: string }>;
};

function takeCategory(raw: string | string[] | undefined): string | null {
  if (!raw) return null;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v?.trim() || null;
}

export default async function NewProgramPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const initialCategorySlug = takeCategory(params.category);

  let duplicateFrom: ProgramRow | null = null;
  if (params.duplicate) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("programs")
      .select("*")
      .eq("id", params.duplicate)
      .maybeSingle();
    if (!data) notFound();
    duplicateFrom = data as ProgramRow;
  }

  const supabase = await createClient();
  const { data: catRows } = await supabase
    .from("program_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  const categories = (catRows ?? []) as ProgramCategoryRow[];

  return (
    <div className="w-full max-w-full">
      <Topbar
        title={duplicateFrom ? "Duplicate program article" : "New program article"}
        subtitle={
          duplicateFrom
            ? `Pre-filled from "${duplicateFrom.title}". Change what you need and save.`
            : "Pick a category, add a cover, and tell the story."
        }
        backUrl="/dashboard/programs"
      />
      <ProgramForm
        mode="create"
        categories={categories}
        initialCategorySlug={initialCategorySlug}
        duplicateFrom={duplicateFrom}
      />
    </div>
  );
}
