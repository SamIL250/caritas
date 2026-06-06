"use client";

import { useRef } from "react";
import EventBanner from "./EventBanner";
import EventsFab, { type EventsFabHandle } from "./EventsFab";

/**
 * Wraps the EventBanner + EventsFab so the banner can trigger the panel open.
 */
export default function EventsWidget() {
  const fabRef = useRef<EventsFabHandle>(null);

  return (
    <>
      <EventBanner onOpenEvents={() => fabRef.current?.open()} />
      <EventsFab ref={fabRef} />
    </>
  );
}
