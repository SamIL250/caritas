import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import EventForm from "../EventForm";
import type { EventRow } from "@/lib/events";

type Props = {
  searchParams?: Promise<{ duplicate?: string }>;
};

export default async function NewEventPage({ searchParams }: Props) {
  let duplicateFrom: EventRow | null = null;

  if (searchParams) {
    const params = await searchParams;
    if (params?.duplicate) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.duplicate)
        .maybeSingle();
      if (!data) notFound();
      duplicateFrom = data as EventRow;
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <Topbar
        title={duplicateFrom ? "Duplicate event" : "New event"}
        subtitle={
          duplicateFrom
            ? `Pre-filled from "${duplicateFrom.title}". Change what you need and save.`
            : "Add an event to the public calendar."
        }
      />
      <div className="mt-6">
        <EventForm mode="create" duplicateFrom={duplicateFrom} />
      </div>
    </div>
  );
}
