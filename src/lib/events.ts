import type { Database } from "@/types/database.types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventStatus = Database["public"]["Enums"]["event_status"];

export type EventGalleryItem = { url: string; alt?: string; sort_order?: number };

export function parseEventGallery(raw: unknown): EventGalleryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is EventGalleryItem => Boolean(x) && typeof (x as EventGalleryItem).url === "string")
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

/**
 * Build the Google Calendar `?action=TEMPLATE` URL — works without OAuth,
 * opens Google Calendar with prefilled fields.
 */
export function buildGoogleCalendarUrl(ev: {
  title: string;
  description?: string;
  location?: string;
  starts_at: string;
  ends_at?: string | null;
  is_all_day?: boolean;
}): string {
  const params = new URLSearchParams();
  params.set("action", "TEMPLATE");
  params.set("text", ev.title);
  if (ev.description) params.set("details", stripHtml(ev.description).slice(0, 8000));
  if (ev.location) params.set("location", ev.location);

  const start = new Date(ev.starts_at);
  const end = ev.ends_at ? new Date(ev.ends_at) : new Date(start.getTime() + 60 * 60 * 1000);
  if (ev.is_all_day) {
    params.set("dates", `${ymd(start)}/${ymd(addDays(end, 1))}`);
  } else {
    params.set("dates", `${utcStamp(start)}/${utcStamp(end)}`);
  }
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

/** Build a downloadable .ics file body for offline / non-Google calendars. */
export function buildIcsContent(ev: {
  id: string;
  title: string;
  description?: string;
  location?: string;
  starts_at: string;
  ends_at?: string | null;
  is_all_day?: boolean;
  url?: string;
}): string {
  const start = new Date(ev.starts_at);
  const end = ev.ends_at ? new Date(ev.ends_at) : new Date(start.getTime() + 60 * 60 * 1000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Caritas Rwanda//Events//EN",
    "BEGIN:VEVENT",
    `UID:${ev.id}@caritasrwanda`,
    `DTSTAMP:${utcStamp(new Date())}`,
    ev.is_all_day
      ? `DTSTART;VALUE=DATE:${ymd(start)}`
      : `DTSTART:${utcStamp(start)}`,
    ev.is_all_day
      ? `DTEND;VALUE=DATE:${ymd(addDays(end, 1))}`
      : `DTEND:${utcStamp(end)}`,
    `SUMMARY:${icsEscape(ev.title)}`,
    ev.description ? `DESCRIPTION:${icsEscape(stripHtml(ev.description))}` : "",
    ev.location ? `LOCATION:${icsEscape(ev.location)}` : "",
    ev.url ? `URL:${icsEscape(ev.url)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

function utcStamp(d: Date): string {
  const iso = d.toISOString();
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
function ymd(d: Date): string {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}
function icsEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Format a single event time range for UI consumption. */
export function formatEventDateRange(ev: Pick<EventRow, "starts_at" | "ends_at" | "is_all_day">): string {
  const start = new Date(ev.starts_at);
  const end = ev.ends_at ? new Date(ev.ends_at) : null;

  const sameDay = end ? sameYmd(start, end) : true;
  const dateOpts: Intl.DateTimeFormatOptions = { dateStyle: "medium" };
  const timeOpts: Intl.DateTimeFormatOptions = { timeStyle: "short" };

  if (ev.is_all_day) {
    if (!end || sameDay) return start.toLocaleDateString(undefined, dateOpts);
    return `${start.toLocaleDateString(undefined, dateOpts)} – ${end.toLocaleDateString(undefined, dateOpts)}`;
  }

  if (!end) return `${start.toLocaleDateString(undefined, dateOpts)} · ${start.toLocaleTimeString(undefined, timeOpts)}`;
  if (sameDay) {
    return `${start.toLocaleDateString(undefined, dateOpts)} · ${start.toLocaleTimeString(undefined, timeOpts)} – ${end.toLocaleTimeString(undefined, timeOpts)}`;
  }
  return `${start.toLocaleString(undefined, { ...dateOpts, ...timeOpts })} – ${end.toLocaleString(undefined, { ...dateOpts, ...timeOpts })}`;
}

function sameYmd(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function eventOccursOnDay(
  ev: Pick<EventRow, "starts_at" | "ends_at">,
  day: Date,
): boolean {
  const start = new Date(ev.starts_at);
  const end = ev.ends_at ? new Date(ev.ends_at) : start;
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  return start <= dayEnd && end >= dayStart;
}
