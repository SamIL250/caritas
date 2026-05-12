import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { EventRow } from "@/lib/events";
import EventForm from "../EventForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const event = data as EventRow;

  return (
    <div className="w-full max-w-3xl">
      <Topbar title="Edit event" subtitle={event.title} />
      <div className="mt-6">
        <EventForm mode="edit" event={event} />
      </div>
    </div>
  );
}
