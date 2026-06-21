import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import { Copy } from "lucide-react";
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
    <div className="w-full max-w-full">
      <Topbar
        title="Edit program article"
        subtitle="Update the article body, cover or category."
        backUrl="/dashboard/programs"
      />
      <div className="flex justify-end">
        <Link
          href={`/dashboard/programs/new?duplicate=${program.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#7A1515]"
        >
          <Copy size={13} aria-hidden />
          Duplicate this program
        </Link>
      </div>
      <ProgramForm mode="edit" program={program} categories={categories} />
    </div>
  );
}
