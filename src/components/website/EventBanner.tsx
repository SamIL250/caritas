"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type EventRow, formatEventDateRange } from "@/lib/events";

const SESSION_KEY = "ev_banner_dismissed";
const REAPPEAR_MS = 10 * 60 * 1000; // 10 minutes

/**
 * A small banner floating above the EventsFab that shows the next upcoming event.
 *
 * Behaviour:
 * - Shows the closest future event (title + date).
 * - Clicking the banner opens the EventsFab panel via callback.
 * - Dismissing it sets a sessionStorage flag + timestamp.
 * - After 10 minutes the flag expires and the banner reappears.
 */
export default function EventBanner({
  onOpenEvents,
}: {
  onOpenEvents: () => void;
}) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch upcoming events on mount
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      try {
        const nowIso = new Date().toISOString();
        const { data } = await supabase
          .from("events")
          .select("*")
          .eq("status", "published")
          .or(`starts_at.gte.${nowIso},ends_at.gte.${nowIso}`)
          .order("starts_at", { ascending: true })
          .limit(5);
        if (!cancelled) setEvents((data || []) as EventRow[]);
      } catch {
        // silent – banner is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Check sessionStorage for dismissal state
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const { ts } = JSON.parse(stored) as { ts: number };
        const elapsed = Date.now() - ts;
        if (elapsed < REAPPEAR_MS) {
          setDismissed(true);
          // Set a timer to auto-reappear after the remaining time
          const remaining = REAPPEAR_MS - elapsed;
          dismissTimerRef.current = setTimeout(() => {
            setDismissed(false);
            sessionStorage.removeItem(SESSION_KEY);
          }, remaining);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const nextEvent = useMemo(() => events[0] ?? null, [events]);

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }));
    } catch {
      // storage unavailable
    }
    // Reappear after 10 minutes
    dismissTimerRef.current = setTimeout(() => {
      setDismissed(false);
      sessionStorage.removeItem(SESSION_KEY);
    }, REAPPEAR_MS);
  }

  if (loading || !nextEvent || dismissed) return null;

  return (
    <div
      className={`ev-banner${nextEvent.featured_image_url?.trim() ? " ev-banner--has-image" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onOpenEvents}
      onKeyDown={(e) => e.key === "Enter" && onOpenEvents()}
      aria-label={`Upcoming event: ${nextEvent.title}`}
    >
      {nextEvent.featured_image_url?.trim() ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={nextEvent.featured_image_url}
          alt=""
          className="ev-banner__img"
          width={40}
          height={40}
        />
      ) : (
        <div className="ev-banner__icon">
          <CalendarIcon size={14} strokeWidth={2} />
        </div>
      )}
      <div className="ev-banner__body">
        <span className="ev-banner__title">{nextEvent.title}</span>
        <span className="ev-banner__date">{formatEventDateRange(nextEvent)}</span>
      </div>
      <button
        type="button"
        className="ev-banner__close"
        onClick={handleDismiss}
        aria-label="Dismiss event banner"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}
