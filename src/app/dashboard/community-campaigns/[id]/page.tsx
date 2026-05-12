import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import { CampaignForm } from "@/components/dashboard/community-campaigns/CampaignForm";
import type { Database } from "@/types/database.types";

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

export default async function EditCommunityCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: campaign }, { data: categories }] = await Promise.all([
    supabase.from("community_campaigns").select("*").eq("id", id).maybeSingle(),
    supabase.from("community_campaign_categories").select("*").order("sort_order", { ascending: true }),
  ]);

  const row = campaign as Database["public"]["Tables"]["community_campaigns"]["Row"] | null;
  if (!row) notFound();

  const catRows = (categories ?? []) as Database["public"]["Tables"]["community_campaign_categories"]["Row"][];
  const editorHref = await homeFeaturedHref(supabase);

  return (
    <div className="w-full max-w-5xl space-y-6">
      <Topbar title="Edit campaign" subtitle={row.title} />
      <CampaignForm mode="edit" campaign={row} categories={catRows} homeFeaturedEditorHref={editorHref} />
    </div>
  );
}
