import Link from "next/link";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { fetchEnrichedCommentModerationQueues } from "@/lib/community-campaign-moderation-data";
import { Topbar } from "@/components/layout/Topbar";
import CampaignsDashboardClient from "@/components/dashboard/community-campaigns/CampaignsDashboardClient";
import type { Database } from "@/types/database.types";

async function loadHomeFeaturedEditorHref(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: homePage } = await supabase.from("pages").select("id").eq("slug", "home").maybeSingle();
  if (!homePage?.id) return { href: null as string | null, configured: false };
  const { data: sec } = await supabase
    .from("sections")
    .select("id")
    .eq("page_id", homePage.id)
    .eq("type", "featured_campaign")
    .maybeSingle();
  if (!sec?.id) return { href: null as string | null, configured: false };
  return {
    href: `/dashboard/pages/${homePage.id}?section=${sec.id}`,
    configured: true,
  };
}

export default async function CommunityCampaignsPage() {
  const supabase = await createClient();

  const [{ data: campaigns }, { data: categories }, queues, homeFeatured] = await Promise.all([
    supabase.from("community_campaigns").select("*").order("updated_at", { ascending: false }),
    supabase.from("community_campaign_categories").select("*").order("sort_order", { ascending: true }),
    fetchEnrichedCommentModerationQueues(supabase),
    loadHomeFeaturedEditorHref(supabase),
  ]);

  const pendingComments = queues.pending;
  const approvedComments = queues.approved;
  const rejectedComments = queues.rejected;

  const rows = (campaigns ?? []) as Database["public"]["Tables"]["community_campaigns"]["Row"][];
  const catRows = (categories ?? []) as Database["public"]["Tables"]["community_campaign_categories"]["Row"][];

  const homePageHref = "/";

  return (
    <div className="w-full max-w-5xl">
      <Topbar
        title="Campaigns"
        subtitle={
          <>
            Manage stories, categories, comments, and homepage featuring. Donation listings use{" "}
            <strong>Accept donations</strong> on each campaign (published). Open{" "}
            <Link
              href={homePageHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515] hover:decoration-[#7A1515]/40"
            >
              the live site
            </Link>{" "}
            to verify.
          </>
        }
      />

      <Suspense fallback={<div className="mt-8 text-sm text-stone-500">Loading campaigns…</div>}>
        <CampaignsDashboardClient
          campaigns={rows}
          categories={catRows}
          pendingComments={pendingComments}
          approvedComments={approvedComments}
          rejectedComments={rejectedComments}
          homeFeaturedEditorHref={homeFeatured.href}
          featuredSectionConfigured={homeFeatured.configured}
        />
      </Suspense>
    </div>
  );
}
