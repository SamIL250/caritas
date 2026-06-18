import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

/* ------------------------------------------------------------------ */
/*  Context: fetches live DB data and formats it for the system prompt */
/* ------------------------------------------------------------------ */

type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type ProgramCategoryRow = Database["public"]["Tables"]["program_categories"]["Row"];
type NewsArticleRow = Database["public"]["Tables"]["news_articles"]["Row"];
type PublicationRow = Database["public"]["Tables"]["publications"]["Row"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];

/** Limit the number of items per category so the system prompt stays compact. */
const MAX_PROGRAM_PILLARS = 4;
const MAX_PROGRAM_ITEMS = 6;
const MAX_NEWS_ITEMS = 8;
const MAX_PUBLICATIONS_PER_CATEGORY = 3;
const MAX_EVENTS = 6;

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function trimExcerpt(text: string | null, max = 140): string {
  if (!text) return "";
  const t = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

/* ------------------------------------------------------------------ */
/*  Data fetchers (memoised within a single server-action invocation)  */
/* ------------------------------------------------------------------ */

async function fetchPrograms() {
  const supabase = await createClient();
  const [progRes, catRes] = await Promise.all([
    supabase
      .from("programs")
      .select("title,slug,excerpt,category_id,featured,status")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .limit(MAX_PROGRAM_ITEMS),
    supabase
      .from("program_categories")
      .select("id,slug,label,description,sort_order")
      .order("sort_order", { ascending: true })
      .limit(MAX_PROGRAM_PILLARS),
  ]);
  return {
    programs: (progRes.data ?? []) as ProgramRow[],
    categories: (catRes.data ?? []) as ProgramCategoryRow[],
  };
}

async function fetchNews() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news_articles")
    .select("title,slug,excerpt,category,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(MAX_NEWS_ITEMS);
  return (data ?? []) as NewsArticleRow[];
}

async function fetchPublications() {
  const supabase = await createClient();
  const [pubRes, catRes] = await Promise.all([
    supabase
      .from("publications")
      .select("title,slug,excerpt,category,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(MAX_PUBLICATIONS_PER_CATEGORY * 5),
    supabase
      .from("publication_categories")
      .select("slug,label,plural_label")
      .order("sort_order", { ascending: true }),
  ]);
  return {
    publications: (pubRes.data ?? []) as PublicationRow[],
    categories: (catRes.data ?? []) as { slug: string; label: string; plural_label: string }[],
  };
}

async function fetchUpcomingEvents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("title,slug,summary,starts_at,ends_at,location_label,category_label,registration_url")
    .eq("status", "published")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(MAX_EVENTS);
  return (data ?? []) as EventRow[];
}

async function fetchContactInfo() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("contact_email, tagline")
    .eq("id", 1)
    .maybeSingle();
  return data as Pick<Database["public"]["Tables"]["site_settings"]["Row"], "contact_email" | "tagline"> | null;
}

/* ------------------------------------------------------------------ */
/*  Main context builder                                               */
/* ------------------------------------------------------------------ */

export interface ChatDatabaseContext {
  /** Plain-text summary for the system instruction. */
  summary: string;
}

/**
 * Fetch all relevant database content and format it as structured plain text
 * that gets injected into the chatbot's system instruction.
 *
 * This runs inside each server-action invocation so the data is always fresh.
 */
export async function buildChatDatabaseContext(): Promise<ChatDatabaseContext> {
  const [{ programs, categories }, news, { publications, categories: pubCats }, events, contact] =
    await Promise.all([
      fetchPrograms(),
      fetchNews(),
      fetchPublications(),
      fetchUpcomingEvents(),
      fetchContactInfo(),
    ]);

  const lines: string[] = [];
  lines.push("========================================");
  lines.push("CARITAS RWANDA — DATABASE CONTEXT");
  lines.push("(Live data from the CMS, refreshed each conversation)");
  lines.push("========================================");
  lines.push("");

  /* ---- Organisation overview ---- */
  lines.push("── ORGANISATION OVERVIEW ──");
  lines.push("Name: Caritas Rwanda");
  lines.push("Founded: 1959 (Le Secours Catholique Rwandais)");
  lines.push("Headquarters: Kigali, Rwanda");
  lines.push(`Contact email: ${contact?.contact_email || "info@caritasrwanda.org"}`);
  lines.push(`Phone: (+250) 252 574 344`);
  lines.push("Tagline: Faith. Charity. Justice.");
  lines.push("Key stats: 67+ years of service · 9 diocesan networks · ~500K+ beneficiaries reached");

  const tagline = contact?.tagline;
  if (tagline?.trim()) {
    lines.push(`Site tagline: ${tagline}`);
  }
  lines.push("");

  /* ---- Programs / Pillars ---- */
  lines.push("── PROGRAM PILLARS ──");
  if (categories.length === 0) {
    lines.push("(No program categories configured yet.)");
  } else {
    for (const cat of categories) {
      const desc = cat.description
        ? ` — ${trimExcerpt(cat.description, 200)}`
        : "";
      lines.push(`• ${cat.label} (${cat.slug})${desc}`);
      const catPrograms = programs.filter((p) => p.category_id === cat.id);
      if (catPrograms.length > 0) {
        for (const p of catPrograms) {
          const excerpt = trimExcerpt(p.excerpt, 100);
          lines.push(`  - ${p.title}: ${excerpt}`);
        }
      }
    }
  }
  // Remaining programs not in the top categories
  const catIds = new Set(categories.map((c) => c.id));
  const uncategorised = programs.filter((p) => !catIds.has(p.category_id));
  if (uncategorised.length > 0) {
    lines.push(`• Other programs (${uncategorised.length} more):`);
    for (const p of uncategorised) {
      const excerpt = trimExcerpt(p.excerpt, 100);
      lines.push(`  - ${p.title}: ${excerpt}`);
    }
  }
  lines.push("");

  /* ---- Recent News ---- */
  lines.push("── RECENT NEWS & STORIES ──");
  if (news.length === 0) {
    lines.push("(No published articles yet.)");
  } else {
    for (const a of news) {
      const date = fmtDate(a.published_at);
      const excerpt = trimExcerpt(a.excerpt, 140);
      const cat = a.category
        ? a.category.charAt(0).toUpperCase() + a.category.slice(1)
        : "";
      lines.push(`• ${a.title} (${date}) — ${cat}`);
      if (excerpt) lines.push(`  ${excerpt}`);
    }
  }
  lines.push("");

  /* ---- Upcoming Events ---- */
  lines.push("── UPCOMING EVENTS ──");
  if (events.length === 0) {
    lines.push("(No upcoming events scheduled.)");
  } else {
    for (const ev of events) {
      const date = fmtDate(ev.starts_at);
      const loc = ev.location_label ? ` @ ${ev.location_label}` : "";
      lines.push(`• ${ev.title} — ${date}${loc}`);
      if (ev.summary) lines.push(`  ${trimExcerpt(ev.summary, 120)}`);
    }
  }
  lines.push("");

  /* ---- Publications ---- */
  lines.push("── PUBLICATIONS & RESOURCES ──");
  if (publications.length === 0) {
    lines.push("(No publications yet.)");
  } else {
    // Group by category
    const grouped = new Map<string, PublicationRow[]>();
    for (const p of publications) {
      const catSlug = p.category || "other";
      if (!grouped.has(catSlug)) grouped.set(catSlug, []);
      grouped.get(catSlug)!.push(p);
    }
    for (const [catSlug, items] of grouped) {
      const catLabel =
        pubCats.find((c: { slug: string; label: string }) => c.slug === catSlug)
          ?.label || catSlug;
      lines.push(`[${catLabel}]`);
      const slice = items.slice(0, MAX_PUBLICATIONS_PER_CATEGORY);
      for (const p of slice) {
        const date = fmtDate(p.published_at);
        lines.push(`  • ${p.title} (${date})`);
        const excerpt = trimExcerpt(p.excerpt, 120);
        if (excerpt) lines.push(`    ${excerpt}`);
      }
      if (items.length > MAX_PUBLICATIONS_PER_CATEGORY) {
        lines.push(`    (+ ${items.length - MAX_PUBLICATIONS_PER_CATEGORY} more)`);
      }
    }
  }
  lines.push("");

  /* ---- How to get involved ---- */
  lines.push("── HOW TO GET INVOLVED ──");
  lines.push("• Donate: Via the Donate / CTA section on the homepage or /donate");
  lines.push("• Volunteer: Submit an application via the volunteer section on the website");
  lines.push("• Partner: Contact us via the Contact form at /contact");
  lines.push("• Subscribe: Newsletter sign-up in the website footer");
  lines.push("• Contact: info@caritasrwanda.org | (+250) 252 574 344");
  lines.push("");

  return { summary: lines.join("\n") };
}
