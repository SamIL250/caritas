import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/lib/supabase/server";
import { AccessRequestsClient } from "./AccessRequestsClient";

export default async function AccessRequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await (supabase as any)
    .from("publication_access_requests")
    .select("*, publications!inner(title)")
    .order("created_at", { ascending: false });

  const rows = (requests || []).map((r: any) => ({
    id: r.id,
    publication_id: r.publication_id,
    requester_email: r.requester_email,
    status: r.status as "pending" | "granted" | "denied",
    created_at: r.created_at,
    updated_at: r.updated_at,
    publication_title: r.publications?.title ?? "Unknown",
  }));

  return (
    <div className="w-full max-w-full">
      <Topbar title="Access Requests" subtitle="Manage requests to locked publications" />
      <div className="mt-6">
        <AccessRequestsClient requests={rows} />
      </div>
    </div>
  );
}
