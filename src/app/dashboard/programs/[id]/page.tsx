import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { ProgramCategoryRow, ProgramRow } from "@/lib/programs";
import ProgramForm from "../ProgramForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProgramPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: progRow }, { data: catRows }] = await Promise.all([
    supabase.from("programs").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("program_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true }),
  ]);

  if (!progRow) notFound();
  const program = progRow as ProgramRow;
  const categories = (catRows ?? []) as ProgramCategoryRow[];

  return (
    <div className="w-full max-w-5xl">
      <Topbar
        title="Edit program"
        subtitle="Update the article body, cover or category."
      />
      <ProgramForm mode="edit" program={program} categories={categories} />
    </div>
  );
}
