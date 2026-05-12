import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { EventRow } from "@/lib/events";
import EventsDashboardClient from "./EventsDashboardClient";

export default async function DashboardEventsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });
  const events = (data ?? []) as EventRow[];

  return (
    <div className="w-full max-w-6xl">
      <Topbar
        title="Events"
        subtitle={
          <>
            Plan and publish events shown in the floating events panel on the public site. Open from the{" "}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-[3px] hover:text-[#7A1515] hover:decoration-[#7A1515]/40"
            >
              homepage
            </Link>{" "}
            footer button.
          </>
        }
      />
      <EventsDashboardClient events={events} />
    </div>
  );
}
