import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { Database } from "@/types/database.types";
import type { TestimonyRow } from "@/lib/testimonies";
import PublicationsDashboardClient from "./PublicationsDashboardClient";

export default async function DashboardPublicationsPage() {
  const supabase = await createClient();
  const [{ data: rows }, { data: cats }, { data: testimonyRows }, { data: pageRow }] = await Promise.all([
    supabase.from("publications").select("*").order("updated_at", { ascending: false }),
    supabase
      .from("publication_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true }),
    supabase.from("testimonies").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
    supabase.from("pages").select("id").eq("slug", "publications").maybeSingle(),
  ]);

  const items = (rows ?? []) as Database["public"]["Tables"]["publications"]["Row"][];
  const categories =
    (cats ?? []) as Database["public"]["Tables"]["publication_categories"]["Row"][];
  const testimonies = (testimonyRows ?? []) as TestimonyRow[];
  const editorHref = pageRow?.id ? `/dashboard/pages/${pageRow.id}` : null;

  return (
    <div className="w-full max-w-full">
      <Topbar
        title="Publications"
        subtitle={
          <>
            PDFs, newsletters, stories and external updates published on{" "}
            <Link
              href="/publications"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515]"
            >
              /publications
            </Link>
            .
          </>
        }
      />
      <PublicationsDashboardClient
        items={items}
        categories={categories}
        testimonies={testimonies}
        publicationsPageEditorHref={editorHref}
      />
    </div>
  );
}
