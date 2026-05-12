import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { ProgramCategoryRow } from "@/lib/programs";
import ProgramCategoryForm from "@/components/dashboard/programs/ProgramCategoryForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProgramCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: catRow } = await supabase
    .from("program_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!catRow) notFound();
  const category = catRow as ProgramCategoryRow;

  return (
    <div className="w-full max-w-5xl">
      <Topbar
        title="Edit program category"
        subtitle="Tune the appearance, slug or description for this program area."
      />
      <ProgramCategoryForm mode="edit" category={category} />
    </div>
  );
}
