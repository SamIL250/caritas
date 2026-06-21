import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import { Copy } from "lucide-react";
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
      <div className="mt-2 flex justify-end">
        <Link
          href={`/dashboard/events/new?duplicate=${event.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#7A1515]"
        >
          <Copy size={13} aria-hidden />
          Duplicate this event
        </Link>
      </div>
      <div className="mt-6">
        <EventForm mode="edit" event={event} />
      </div>
    </div>
  );
}
