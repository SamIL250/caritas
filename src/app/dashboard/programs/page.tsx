import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type {
  ProgramCategoryRow,
  ProgramRow,
} from "@/lib/programs";
import ProgramsDashboardClient from "./ProgramsDashboardClient";

export default async function DashboardProgramsPage() {
  const supabase = await createClient();
  const [{ data: programs }, { data: cats }, { data: programsPageRow }] = await Promise.all([
    supabase.from("programs").select("*").order("updated_at", { ascending: false }),
    supabase
      .from("program_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true }),
    supabase.from("pages").select("id").eq("slug", "programs").maybeSingle(),
  ]);

  const items = (programs ?? []) as ProgramRow[];
  const categories = (cats ?? []) as ProgramCategoryRow[];
  const editorHref = programsPageRow?.id ? `/dashboard/pages/${programsPageRow.id}` : null;

  return (
    <div className="w-full max-w-5xl">
      <Topbar
        title="Programs"
        subtitle={
          <>
            Articles, projects and stories shown on{" "}
            <Link
              href="/programs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515] hover:decoration-[#7A1515]/40"
            >
              /programs
            </Link>
            .
          </>
        }
      />
      <ProgramsDashboardClient
        items={items}
        categories={categories}
        programsPageEditorHref={editorHref}
      />
    </div>
  );
}
