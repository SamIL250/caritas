import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { VolunteerApplicationRow } from "@/app/actions/volunteer-applications";
import VolunteerApplicationReview from "./VolunteerApplicationReview";

type PageProps = { params: Promise<{ id: string }> };

export default async function VolunteerApplicationPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: row }, { data: camps }] = await Promise.all([
    supabase.from("volunteer_applications").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("community_campaigns")
      .select("id, title")
      .eq("status", "published")
      .order("title", { ascending: true }),
  ]);

  if (!row) notFound();
  const application = row as VolunteerApplicationRow;
  const campaignOptions = (camps ?? []) as { id: string; title: string }[];

  let preferredCampaignTitle = "Any open opportunity";
  if (application.preferred_campaign_id) {
    const { data: pref } = await supabase
      .from("community_campaigns")
      .select("title")
      .eq("id", application.preferred_campaign_id)
      .maybeSingle();
    preferredCampaignTitle = pref?.title ?? "(unknown campaign)";
  }

  return (
    <div className="w-full max-w-3xl">
      <Topbar
        title="Volunteer application"
        subtitle={
          <>
            Review applicant details and update status.{" "}
            <Link
              href="/dashboard/volunteers"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515]"
            >
              All applications
            </Link>
          </>
        }
      />
      <VolunteerApplicationReview
        application={application}
        campaignOptions={campaignOptions}
        preferredCampaignTitle={preferredCampaignTitle}
      />
    </div>
  );
}
