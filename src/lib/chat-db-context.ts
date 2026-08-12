import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import { DEFAULT_SECTION_CONTENT } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Context: fetches live DB data and formats it for the system prompt */
/* ------------------------------------------------------------------ */

type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type ProgramCategoryRow = Database["public"]["Tables"]["program_categories"]["Row"];
type NewsArticleRow = Database["public"]["Tables"]["news_articles"]["Row"];
type PublicationRow = Database["public"]["Tables"]["publications"]["Row"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];

/** Limit the number of items per category so the system prompt stays usable. */
const MAX_PROGRAM_PILLARS = 8;
const MAX_PROGRAM_ITEMS = 40;
const MAX_NEWS_ITEMS = 12;
const MAX_PUBLICATIONS_PER_CATEGORY = 5;
const MAX_EVENTS = 8;

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

function trimExcerpt(text: string | null, max = 220): string {
  if (!text) return "";
  const t = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

/* ------------------------------------------------------------------ */
/*  Data fetchers                                                      */
/* ------------------------------------------------------------------ */

async function fetchPrograms() {
  const supabase = await createClient();
  const [progRes, catRes] = await Promise.all([
    supabase
      .from("programs")
      .select(
        "title,slug,excerpt,subtitle,location,project_period,carried_by,contact_phone,category_id,featured,status,tag_label",
      )
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
      .limit(MAX_PUBLICATIONS_PER_CATEGORY * 6),
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
  return data as Pick<
    Database["public"]["Tables"]["site_settings"]["Row"],
    "contact_email" | "tagline"
  > | null;
}

type NetworkNode = { value?: string; label?: string };

async function fetchNetworkStats(): Promise<NetworkNode[]> {
  const defaults =
    (DEFAULT_SECTION_CONTENT.home_about as { networkNodes?: NetworkNode[] } | undefined)
      ?.networkNodes ?? [];

  try {
    const supabase = await createClient();
    const { data: homePage } = await supabase
      .from("pages")
      .select("id")
      .eq("slug", "home")
      .maybeSingle();

    if (!homePage?.id) return defaults;

    const { data: section } = await supabase
      .from("sections")
      .select("content")
      .eq("page_id", homePage.id)
      .eq("type", "home_about")
      .maybeSingle();

    const content = section?.content;
    if (content && typeof content === "object" && !Array.isArray(content)) {
      const nodes = (content as { networkNodes?: unknown }).networkNodes;
      if (Array.isArray(nodes) && nodes.length > 0) {
        return nodes as NetworkNode[];
      }
    }
  } catch {
    /* fall through to defaults */
  }

  return defaults;
}

async function fetchDioceseNames(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data: aboutPage } = await supabase
      .from("pages")
      .select("id")
      .eq("slug", "about")
      .maybeSingle();
    if (!aboutPage?.id) return [];

    const { data: section } = await supabase
      .from("sections")
      .select("content")
      .eq("page_id", aboutPage.id)
      .in("type", ["network_section", "diocese_map_section"])
      .limit(2);

    const names: string[] = [];
    for (const row of section ?? []) {
      const content = row.content;
      if (!content || typeof content !== "object" || Array.isArray(content)) continue;
      const dioceses = (content as { dioceses?: unknown }).dioceses;
      if (!Array.isArray(dioceses)) continue;
      for (const d of dioceses) {
        if (d && typeof d === "object" && typeof (d as { name?: unknown }).name === "string") {
          const name = String((d as { name: string }).name).trim();
          if (name && !names.includes(name)) names.push(name);
        }
      }
    }
    return names;
  } catch {
    return [];
  }
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
 */
export async function buildChatDatabaseContext(): Promise<ChatDatabaseContext> {
  const [
    { programs, categories },
    news,
    { publications, categories: pubCats },
    events,
    contact,
    networkNodes,
    dioceseNames,
  ] = await Promise.all([
    fetchPrograms(),
    fetchNews(),
    fetchPublications(),
    fetchUpcomingEvents(),
    fetchContactInfo(),
    fetchNetworkStats(),
    fetchDioceseNames(),
  ]);

  const lines: string[] = [];
  lines.push("========================================");
  lines.push("CARITAS RWANDA — DATABASE CONTEXT");
  lines.push("(Live CMS data — treat numbers and names below as authoritative)");
  lines.push("========================================");
  lines.push("");

  /* ---- Organisation overview ---- */
  lines.push("── ORGANISATION OVERVIEW ──");
  lines.push("Name: Caritas Rwanda");
  lines.push("Founded: 1959 (Le Secours Catholique Rwandais)");
  lines.push("Headquarters: Kigali, Rwanda");
  lines.push(`Contact email: ${contact?.contact_email || "info@caritasrwanda.org"}`);
  const phone = "(+250) 252 574 344";
  lines.push(`Phone: ${phone}`);
  lines.push("Tagline: Faith. Charity. Justice.");
  lines.push("Website sections: /about · /programs · /news (Stories and Updates) · /publications · /contact");
  lines.push("");

  /* ---- Network / parish structure (critical for common questions) ---- */
  lines.push("── NETWORK & PARISH STRUCTURE (authoritative counts) ──");
  lines.push(
    "Caritas Rwanda works through a multi-level church network. Use these figures when visitors ask about parishes, dioceses, volunteers, or scale:",
  );
  if (networkNodes.length === 0) {
    lines.push("• 1 Caritas Rwanda (national)");
    lines.push("• 10 Diocesan Caritas");
    lines.push("• 229 Parish Caritas");
    lines.push("• 882 Sub-Parish Caritas");
    lines.push("• 29,141 Basic Christian Community Caritas");
    lines.push("• 56,345+ Volunteers");
  } else {
    for (const node of networkNodes) {
      const value = String(node.value ?? "").trim();
      const label = String(node.label ?? "").trim();
      if (!value && !label) continue;
      lines.push(`• ${value}${label ? ` ${label}` : ""}`);
    }
  }
  lines.push(
    "Interpretation tip: If someone asks “how many parishes?”, answer with the Parish Caritas count (229 unless the list above differs) and briefly explain Sub-Parish / Basic Christian Community layers.",
  );
  if (dioceseNames.length > 0) {
    lines.push(`Diocesan network names (${dioceseNames.length}): ${dioceseNames.join("; ")}`);
  }
  lines.push("");

  /* ---- Programs / Pillars ---- */
  lines.push("── PROGRAM PILLARS & PROJECTS ──");
  if (categories.length === 0) {
    lines.push("(No program categories configured yet.)");
  } else {
    for (const cat of categories) {
      const desc = cat.description ? ` — ${trimExcerpt(cat.description, 240)}` : "";
      lines.push(`• ${cat.label} (/${`programs#${cat.slug}`})${desc}`);
      const catPrograms = programs.filter((p) => p.category_id === cat.id);
      if (catPrograms.length === 0) {
        lines.push("  (No published projects listed in this pillar yet.)");
      } else {
        for (const p of catPrograms) {
          const bits = [
            trimExcerpt(p.excerpt || p.subtitle, 180),
            p.location ? `Location: ${p.location}` : "",
            p.project_period ? `Period: ${p.project_period}` : "",
            p.carried_by ? `Carried by: ${p.carried_by}` : "",
            p.contact_phone ? `Contact: ${p.contact_phone}` : "",
          ].filter(Boolean);
          lines.push(`  - ${p.title}${p.slug ? ` [/programs/${p.slug}]` : ""}`);
          if (bits.length) lines.push(`    ${bits.join(" · ")}`);
        }
      }
    }
  }
  const catIds = new Set(categories.map((c) => c.id));
  const uncategorised = programs.filter((p) => !catIds.has(p.category_id as string));
  if (uncategorised.length > 0) {
    lines.push(`• Other programs:`);
    for (const p of uncategorised) {
      lines.push(`  - ${p.title}: ${trimExcerpt(p.excerpt, 160)}`);
    }
  }
  lines.push("");

  /* ---- Recent News ---- */
  lines.push("── RECENT STORIES & UPDATES (/news) ──");
  if (news.length === 0) {
    lines.push("(No published articles yet.)");
  } else {
    for (const a of news) {
      const date = fmtDate(a.published_at);
      const excerpt = trimExcerpt(a.excerpt, 180);
      const cat = a.category
        ? a.category.charAt(0).toUpperCase() + a.category.slice(1)
        : "";
      lines.push(`• ${a.title}${date ? ` (${date})` : ""}${cat ? ` — ${cat}` : ""} [/news/${a.slug}]`);
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
      if (ev.summary) lines.push(`  ${trimExcerpt(ev.summary, 160)}`);
      if (ev.registration_url) lines.push(`  Register: ${ev.registration_url}`);
    }
  }
  lines.push("");

  /* ---- Publications ---- */
  lines.push("── PUBLICATIONS & RESOURCES (/publications) ──");
  if (publications.length === 0) {
    lines.push("(No publications yet.)");
  } else {
    const grouped = new Map<string, PublicationRow[]>();
    for (const p of publications) {
      const catSlug = p.category || "other";
      if (!grouped.has(catSlug)) grouped.set(catSlug, []);
      grouped.get(catSlug)!.push(p);
    }
    for (const [catSlug, items] of grouped) {
      const catLabel =
        pubCats.find((c: { slug: string; label: string }) => c.slug === catSlug)?.label ||
        catSlug;
      lines.push(`[${catLabel}]`);
      const slice = items.slice(0, MAX_PUBLICATIONS_PER_CATEGORY);
      for (const p of slice) {
        const date = fmtDate(p.published_at);
        lines.push(`  • ${p.title}${date ? ` (${date})` : ""} [/publications/${p.slug}]`);
        const excerpt = trimExcerpt(p.excerpt, 140);
        if (excerpt) lines.push(`    ${excerpt}`);
      }
      if (items.length > MAX_PUBLICATIONS_PER_CATEGORY) {
        lines.push(`    (+ ${items.length - MAX_PUBLICATIONS_PER_CATEGORY} more on /publications)`);
      }
    }
  }
  lines.push("");

  /* ---- How to get involved ---- */
  lines.push("── HOW TO GET INVOLVED ──");
  lines.push("• Donate: homepage Donate button / campaign pages / #donate");
  lines.push("• Volunteer: volunteer application on the website");
  lines.push("• Partner / visit: Contact form at /contact");
  lines.push("• Newsletter: footer subscription");
  lines.push(`• Direct contact: ${contact?.contact_email || "info@caritasrwanda.org"} | ${phone}`);
  lines.push("");

  /* ---- Website builder (Lerony) ---- */
  lines.push("── WEBSITE BUILDER / WHO BUILT THIS SITE ──");
  lines.push(
    "• This Caritas Rwanda website was designed and developed by Lerony (Lerony Co. Ltd).",
  );
  lines.push(
    "• Lerony is an IT technology and innovation in Kigali, Rwanda (1 KN 78 St).",
  );
  lines.push(
    "• Services include web & mobile app development, SEO, GovTech, AI automation, and enterprise software for African enterprises.",
  );
  lines.push("• Website: https://lerony.com · Phone: 0792 054 846");
  lines.push(
    "• If asked “who built / developed / designed this site” or “what is Lerony?”, answer with these facts. Never say Lerony is unknown.",
  );
  lines.push("");

  return { summary: lines.join("\n") };
}
