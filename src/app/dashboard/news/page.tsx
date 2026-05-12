import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { Database } from "@/types/database.types";
import NewsDashboardClient from "./NewsDashboardClient";

export default async function DashboardNewsPage() {
  const supabase = await createClient();
  const [{ data: articles }, { data: newsPageRow }] = await Promise.all([
    supabase.from("news_articles").select("*").order("updated_at", { ascending: false }),
    supabase.from("pages").select("id").eq("slug", "news").maybeSingle(),
  ]);

  const typed = (articles ?? []) as Database["public"]["Tables"]["news_articles"]["Row"][];
  const newsPageEditorHref = newsPageRow?.id
    ? `/dashboard/pages/${newsPageRow.id}`
    : null;

  return (
    <div className="w-full max-w-5xl">
      <Topbar
        title="News"
        subtitle={
          <>
            Manage story cards shown on{" "}
            <Link
              href="/news"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515] hover:decoration-[#7A1515]/40"
            >
              /news
            </Link>
            .
          </>
        }
      />

      <NewsDashboardClient articles={typed} newsPageEditorHref={newsPageEditorHref} />
    </div>
  );
}
