import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import EventForm from "../EventForm";

export default function NewEventPage() {
  return (
    <div className="w-full max-w-3xl">
      <Topbar title="New event" subtitle="Add an event to the public calendar." />
      <div className="mt-6">
        <EventForm mode="create" />
      </div>
    </div>
  );
}
