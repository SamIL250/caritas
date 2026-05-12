import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { Database } from "@/types/database.types";
import { CommunityCampaignCategoriesPanel } from "../CommunityCampaignCategoriesPanel";
import { CommunityCampaignSubnav } from "../CommunityCampaignSubnav";

export default async function CommunityCampaignCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_campaign_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const rows =
    (data ?? []) as Database["public"]["Tables"]["community_campaign_categories"]["Row"][];

  return (
    <div className="w-full max-w-4xl">
      <Topbar
        title="Campaign categories"
        subtitle="Medical Support, Education, Livelihood, and any custom programmes you add."
      />
      <CommunityCampaignSubnav />
      <CommunityCampaignCategoriesPanel initial={rows} />
    </div>
  );
}
