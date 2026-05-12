import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { VolunteerApplicationRow } from "@/app/actions/volunteer-applications";
import VolunteersDashboardClient from "./VolunteersDashboardClient";

export default async function DashboardVolunteersPage() {
  const supabase = await createClient();
  const [{ data: applications }, { data: camps }] = await Promise.all([
    supabase.from("volunteer_applications").select("*").order("created_at", { ascending: false }),
    supabase.from("community_campaigns").select("id, title"),
  ]);

  const rows = (applications ?? []) as VolunteerApplicationRow[];
  const campaignTitleById = Object.fromEntries(
    ((camps ?? []) as { id: string; title: string }[]).map((c) => [c.id, c.title]),
  );

  return (
    <div className="w-full max-w-6xl">
      <Topbar
        title="Volunteers"
        subtitle={
          <>
            Review applications from the public{" "}
            <Link
              href="/get-involved"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515]"
            >
              Get Involved
            </Link>{" "}
            flow. Enable volunteer signup per campaign under{" "}
            <Link
              href="/dashboard/community-campaigns"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515]"
            >
              Campaigns
            </Link>
            .
          </>
        }
      />
      <VolunteersDashboardClient applications={rows} campaignTitleById={campaignTitleById} />
    </div>
  );
}
