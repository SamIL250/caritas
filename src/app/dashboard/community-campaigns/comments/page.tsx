import { Topbar } from "@/components/layout/Topbar";
import { CampaignModerationQueues } from "@/components/dashboard/community-campaigns/CampaignModerationQueues";
import { fetchEnrichedCommentModerationQueues } from "@/lib/community-campaign-moderation-data";
import { createClient } from "@/lib/supabase/server";

import { CommunityCampaignSubnav } from "../CommunityCampaignSubnav";

export default async function CommunityCampaignCommentsPage() {
  const supabase = await createClient();
  const { pending, approved, rejected } = await fetchEnrichedCommentModerationQueues(supabase);

  return (
    <div className="w-full max-w-4xl">
      <Topbar
        title="Comment moderation"
        subtitle="Approve or reject visitor messages before they appear under published campaigns."
      />
      <CommunityCampaignSubnav />
      <CampaignModerationQueues
        pendingComments={pending}
        approvedComments={approved}
        rejectedComments={rejected}
      />
    </div>
  );
}
