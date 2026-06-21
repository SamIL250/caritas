import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import { CampaignForm } from "@/components/dashboard/community-campaigns/CampaignForm";
import type { Database } from "@/types/database.types";

type CampaignRow = Database["public"]["Tables"]["community_campaigns"]["Row"];

async function homeFeaturedHref(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: homePage } = await supabase.from("pages").select("id").eq("slug", "home").maybeSingle();
  if (!homePage?.id) return null;
  const { data: sec } = await supabase
    .from("sections")
    .select("id")
    .eq("page_id", homePage.id)
    .eq("type", "featured_campaign")
    .maybeSingle();
  if (!sec?.id) return null;
  return `/dashboard/pages/${homePage.id}?section=${sec.id}`;
}

export default async function NewCommunityCampaignPage({
  searchParams,
}: {
  searchParams?: Promise<{ duplicate?: string }>;
}) {
  let duplicateFrom: CampaignRow | null = null;

  if (searchParams) {
    const sp = await searchParams;
    if (sp?.duplicate) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("community_campaigns")
        .select("*")
        .eq("id", sp.duplicate)
        .maybeSingle();
      if (!data) notFound();
      duplicateFrom = data as CampaignRow;
    }
  }

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("community_campaign_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const catRows = (categories ?? []) as Database["public"]["Tables"]["community_campaign_categories"]["Row"][];
  const editorHref = await homeFeaturedHref(supabase);

  if (!catRows.length) {
    return (
      <div className="w-full max-w-full space-y-6">
        <Topbar title={duplicateFrom ? "Duplicate campaign" : "New campaign"} subtitle="You need at least one category first." />
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-950">
          <p className="mb-3">Add a category under the Categories tab, then return here.</p>
          <Link
            href="/dashboard/community-campaigns?tab=categories"
            className="font-semibold text-[#7A1515] underline underline-offset-2"
          >
            Open Categories tab →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6">
      <Topbar
        title={duplicateFrom ? "Duplicate campaign" : "New campaign"}
        subtitle={
          duplicateFrom
            ? `Pre-filled from "${duplicateFrom.title}". Change what you need and save.`
            : "Create a campaign story and optionally enable donations."
        }
      />
      <CampaignForm mode="create" categories={catRows} homeFeaturedEditorHref={editorHref} duplicateFrom={duplicateFrom} />
      <p className="text-center text-xs text-stone-400">
        Need another category first?{" "}
        <Link href="/dashboard/community-campaigns?tab=categories" className="text-[#7A1515] underline">
          Categories tab
        </Link>
      </p>
    </div>
  );
}
