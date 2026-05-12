"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  ExternalLink,
  Download,
  Star,
  Share2,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  type EventRow,
  buildGoogleCalendarUrl,
  buildIcsContent,
  formatEventDateRange,
  eventOccursOnDay,
  parseEventGallery,
} from "@/lib/events";
import { useGoogleTranslateDomActive } from "@/lib/use-google-translate-dom";
import "./events-fab.css";

const EV = {
  fab: "Events",
  title: "Upcoming events",
  back: "All events",
  close: "Close events panel",
  loading: "Loading events…",
  emptyTitle: "No upcoming events",
  emptyHint: "Check back soon — we add new events as they are scheduled.",
  noEventsForDay: "No events for this date.",
  registerCta: "Register / RSVP",
  addToCalendar: "Add to Google Calendar",
  downloadIcs: "Download .ics",
  share: "Share",
  contact: "Contact",
  previousMonth: "Previous month",
  nextMonth: "Next month",
} as const;

type FlowView = "list" | "detail";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function EventsFab() {
  const gtDom = useGoogleTranslateDomActive();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<FlowView>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [monthAnchor, setMonthAnchor] = useState<Date>(() => startOfMonth(new Date()));
  const [activeDay, setActiveDay] = useState<Date | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- toggle body scroll + load on open */
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "unset";
      return;
    }
    document.body.style.overflow = "hidden";
    void (async () => {
      const supabase = createClient();
      setLoading(true);
      setError(null);
      try {
        const nowIso = new Date().toISOString();
        const { data, error: qErr } = await supabase
          .from("events")
          .select("*")
          .eq("status", "published")
          .or(`starts_at.gte.${nowIso},ends_at.gte.${nowIso}`)
          .order("starts_at", { ascending: true });
        if (qErr) throw qErr;
        setEvents((data || []) as EventRow[]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not load events.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const selected = useMemo(
    () => events.find((e) => e.id === selectedId) ?? null,
    [events, selectedId],
  );

  const eventsForActiveDay = useMemo(() => {
    if (!activeDay) return events;
    return events.filter((e) => eventOccursOnDay(e, activeDay));
  }, [events, activeDay]);

  const groupedByMonth = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    for (const e of events) {
      const d = new Date(e.starts_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, list]) => ({
        key,
        label: new Date(`${key}-01T00:00:00Z`).toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        }),
        list,
      }));
  }, [events]);

  function close() {
    setOpen(false);
    setView("list");
    setSelectedId(null);
    setActiveDay(null);
  }

  function openDetail(id: string) {
    setSelectedId(id);
    setView("detail");
  }

  function backToList() {
    setSelectedId(null);
    setView("list");
  }

  function downloadIcs(ev: EventRow) {
    const content = buildIcsContent({
      id: ev.id,
      title: ev.title,
      description: ev.description_html ?? ev.summary,
      location: [ev.location_label, ev.location_address].filter(Boolean).join(", "),
      starts_at: ev.starts_at,
      ends_at: ev.ends_at,
      is_all_day: ev.is_all_day,
    });
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ev.slug || "event"}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function shareEvent(ev: EventRow) {
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/?event=${encodeURIComponent(ev.slug)}`;
    const nav = window.navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    try {
      if (typeof nav.share === "function") {
        await nav.share({ title: ev.title, text: ev.summary || ev.title, url: shareUrl });
      } else if (nav.clipboard) {
        await nav.clipboard.writeText(shareUrl);
      }
    } catch {
      /* user cancelled */
    }
  }

  const panelContents = (
    <>
      <header className="events-panel__topbar">
        <div className="events-panel__title">
          <CalendarIcon size={18} className="opacity-80" aria-hidden />
          {view === "detail" && selected ? (
            <button type="button" onClick={backToList} className="events-panel__back">
              <ChevronLeft size={16} aria-hidden /> {EV.back}
            </button>
          ) : (
            <>{EV.title}</>
          )}
        </div>
        <button type="button" className="events-panel__close" onClick={close} aria-label={EV.close}>
          <X size={18} />
        </button>
      </header>

      {view === "list" ? (
        <div className="events-panel__body">
          <CalendarMonthGrid
            monthAnchor={monthAnchor}
            onChangeMonth={(n) => {
              setMonthAnchor((cur) => addMonths(cur, n));
              setActiveDay(null);
            }}
            events={events}
            activeDay={activeDay}
            onSelectDay={(d) => {
              setActiveDay((cur) => (cur && sameDay(cur, d) ? null : d));
            }}
          />

          {loading ? (
            <div className="events-loading">
              <Loader2 size={20} className="animate-spin" />
              {EV.loading}
            </div>
          ) : error ? (
            <p role="alert" className="events-error">
              {error}
            </p>
          ) : events.length === 0 ? (
            <div className="events-empty">
              <p className="events-empty__title">{EV.emptyTitle}</p>
              <p className="events-empty__hint">{EV.emptyHint}</p>
            </div>
          ) : activeDay ? (
            <EventList
              label={activeDay.toLocaleDateString(undefined, { dateStyle: "full" })}
              events={eventsForActiveDay}
              onOpen={openDetail}
              emptyText={EV.noEventsForDay}
            />
          ) : (
            <div className="events-month-list">
              {groupedByMonth.map((g) => (
                <EventList
                  key={g.key}
                  label={g.label}
                  events={g.list}
                  onOpen={openDetail}
                  emptyText={EV.noEventsForDay}
                />
              ))}
            </div>
          )}
        </div>
      ) : selected ? (
        <EventDetail
          event={selected}
          onAddToCalendar={() => {
            const url = buildGoogleCalendarUrl({
              title: selected.title,
              description: selected.description_html ?? selected.summary,
              location: [selected.location_label, selected.location_address].filter(Boolean).join(", "),
              starts_at: selected.starts_at,
              ends_at: selected.ends_at,
              is_all_day: selected.is_all_day,
            });
            window.open(url, "_blank", "noopener");
          }}
          onDownloadIcs={() => downloadIcs(selected)}
          onShare={() => void shareEvent(selected)}
        />
      ) : null}
    </>
  );

  return (
    <>
      <button
        type="button"
        className="events-fab"
        onClick={() => setOpen(true)}
        aria-label={EV.title}
      >
        <span className="events-fab__halo" aria-hidden />
        <CalendarIcon size={22} strokeWidth={2.2} aria-hidden />
        <span className="events-fab__label">{EV.fab}</span>
        {events.length > 0 && !open ? (
          <span className="events-fab__badge" aria-label={`${events.length}`}>
            {events.length}
          </span>
        ) : null}
      </button>

      {!gtDom ? (
        <>
          <AnimatePresence>
            {open ? (
              <motion.div
                key="events-overlay"
                className="events-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
                aria-hidden
              />
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {open ? (
              <motion.aside
                key="events-panel"
                className="events-panel"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 360, damping: 36 }}
                role="dialog"
                aria-modal="true"
                aria-label={EV.title}
              >
                {panelContents}
              </motion.aside>
            ) : null}
          </AnimatePresence>
        </>
      ) : open ? (
        <>
          <div className="events-overlay events-overlay--plain" onClick={close} aria-hidden />
          <aside
            className="events-panel events-panel--plain"
            role="dialog"
            aria-modal="true"
            aria-label={EV.title}
          >
            {panelContents}
          </aside>
        </>
      ) : null}
    </>
  );
}

function CalendarMonthGrid({
  monthAnchor,
  onChangeMonth,
  events,
  activeDay,
  onSelectDay,
}: {
  monthAnchor: Date;
  onChangeMonth: (n: number) => void;
  events: EventRow[];
  activeDay: Date | null;
  onSelectDay: (d: Date) => void;
}) {
  const monthLabel = monthAnchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const total = daysInMonth(monthAnchor);
  const firstDow = startOfMonth(monthAnchor).getDay();
  const today = new Date();

  const cells: Array<{ key: string; date: Date | null }> = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ key: `pad-${i}`, date: null });
  }
  for (let day = 1; day <= total; day++) {
    const date = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), day);
    cells.push({ key: `d-${day}`, date });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${cells.length}`, date: null });
  }

  return (
    <div className="events-cal">
      <div className="events-cal__nav">
        <button
          type="button"
          aria-label={EV.previousMonth}
          onClick={() => onChangeMonth(-1)}
          className="events-cal__nav-btn"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="events-cal__title">{monthLabel}</div>
        <button
          type="button"
          aria-label={EV.nextMonth}
          onClick={() => onChangeMonth(1)}
          className="events-cal__nav-btn"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="events-cal__grid" role="grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`hdr-${i}`} className="events-cal__hdr" role="columnheader">
            {d}
          </div>
        ))}
        {cells.map(({ key, date }) => {
          if (!date) return <div key={key} className="events-cal__cell events-cal__cell--empty" />;
          const has = events.some((e) => eventOccursOnDay(e, date));
          const isToday = sameDay(date, today);
          const isActive = activeDay && sameDay(date, activeDay);
          return (
            <button
              key={key}
              type="button"
              className={`events-cal__cell ${isToday ? "is-today" : ""} ${isActive ? "is-active" : ""} ${
                has ? "has-events" : ""
              }`}
              onClick={() => onSelectDay(date)}
            >
              <span className="events-cal__num">{date.getDate()}</span>
              {has ? <span className="events-cal__dot" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EventList({
  label,
  events,
  onOpen,
  emptyText,
}: {
  label: string;
  events: EventRow[];
  onOpen: (id: string) => void;
  emptyText: string;
}) {
  if (events.length === 0) {
    return (
      <div className="events-month">
        <p className="events-month__label">{label}</p>
        <p className="events-empty__hint">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="events-month">
      <p className="events-month__label">{label}</p>
      <ul className="events-list">
        {events.map((e) => (
          <li key={e.id}>
            <button type="button" className="event-card" onClick={() => onOpen(e.id)}>
              <div className="event-card__thumb">
                {e.featured_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- editor-supplied
                  <img src={e.featured_image_url} alt={e.image_alt || e.title} />
                ) : (
                  <div className="event-card__thumb-fallback" aria-hidden>
                    <CalendarIcon size={22} />
                  </div>
                )}
              </div>
              <div className="event-card__body">
                <div className="event-card__meta">
                  <span>{formatEventDateRange(e)}</span>
                  {e.featured ? (
                    <span className="event-card__featured" aria-label="Featured">
                      <Star size={12} className="fill-amber-400 text-amber-500" />
                    </span>
                  ) : null}
                </div>
                <h3 className="event-card__title">{e.title}</h3>
                {e.location_label ? (
                  <div className="event-card__loc">
                    <MapPin size={12} className="opacity-70" aria-hidden /> {e.location_label}
                  </div>
                ) : null}
                {e.summary ? <p className="event-card__summary">{e.summary}</p> : null}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventDetail({
  event,
  onAddToCalendar,
  onDownloadIcs,
  onShare,
}: {
  event: EventRow;
  onAddToCalendar: () => void;
  onDownloadIcs: () => void;
  onShare: () => void;
}) {
  const gallery = parseEventGallery(event.gallery_images);
  const heroSrc = event.featured_image_url || gallery[0]?.url || "";

  return (
    <div className="events-panel__body event-detail">
      <div className="event-detail__hero">
        {heroSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroSrc} alt={event.image_alt || event.title} className="event-detail__hero-img" />
        ) : (
          <div className="event-detail__hero-fallback" aria-hidden>
            <CalendarIcon size={36} />
          </div>
        )}
        {event.category_label ? (
          <span className="event-detail__chip">{event.category_label}</span>
        ) : null}
      </div>

      <div className="event-detail__inner">
        <h2 className="event-detail__title">{event.title}</h2>

        <ul className="event-detail__meta">
          <li>
            <Clock size={14} className="opacity-70" aria-hidden />
            {formatEventDateRange(event)}
          </li>
          {event.location_label ? (
            <li>
              <MapPin size={14} className="opacity-70" aria-hidden />
              {event.location_url ? (
                <a href={event.location_url} target="_blank" rel="noopener noreferrer" className="event-detail__link">
                  {event.location_label}
                </a>
              ) : (
                event.location_label
              )}
              {event.location_address ? (
                <div className="event-detail__addr">{event.location_address}</div>
              ) : null}
            </li>
          ) : null}
          {event.capacity_label ? <li className="event-detail__capacity">{event.capacity_label}</li> : null}
        </ul>

        {event.description_html ? (
          <div
            className="event-detail__prose"
            dangerouslySetInnerHTML={{ __html: event.description_html }}
          />
        ) : event.summary ? (
          <p className="event-detail__summary">{event.summary}</p>
        ) : null}

        <div className="event-detail__actions">
          {event.registration_url ? (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="event-btn event-btn--primary"
            >
              {EV.registerCta} <ExternalLink size={14} />
            </a>
          ) : null}
          <button type="button" className="event-btn" onClick={onAddToCalendar}>
            {EV.addToCalendar} <ExternalLink size={14} />
          </button>
          <button type="button" className="event-btn" onClick={onDownloadIcs}>
            {EV.downloadIcs} <Download size={14} />
          </button>
          <button type="button" className="event-btn event-btn--ghost" onClick={onShare}>
            {EV.share} <Share2 size={14} />
          </button>
        </div>

        {(event.contact_email || event.contact_phone) && (
          <div className="event-detail__contact">
            <p className="event-detail__contact-label">{EV.contact}</p>
            {event.contact_email ? (
              <a href={`mailto:${event.contact_email}`} className="event-detail__link">
                {event.contact_email}
              </a>
            ) : null}
            {event.contact_phone ? (
              <a href={`tel:${event.contact_phone}`} className="event-detail__link">
                {event.contact_phone}
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
