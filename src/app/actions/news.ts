"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database.types";
import { slugify } from "@/lib/news";

type Category = Database["public"]["Enums"]["news_article_category"];
type Status = Database["public"]["Enums"]["news_article_status"];

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be signed in.");
  return { supabase, user };
}

function parsePublishedAtField(form: FormData): string | null {
  const raw = String(form.get("published_at") || "").trim();
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseDepartmentIdField(form: FormData): string | null {
  const raw = String(form.get("department_id") || "").trim();
  return raw || null;
}

async function nextUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  excludeId?: string
): Promise<string> {
  let candidate = base || "story";
  for (let n = 0; n < 30; n++) {
    const row = await supabase
      .from("news_articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    const id = row.data?.id as string | undefined;
    if (!id || (excludeId && id === excludeId)) return candidate;
    candidate = `${base}-${n + 2}`;
  }
  return `${base}-${Date.now()}`;
}

async function clearOtherFeatured(supabase: Awaited<ReturnType<typeof createClient>>, exceptId?: string) {
  let q = supabase.from("news_articles").update({ featured: false }).eq("featured", true);
  if (exceptId) q = q.neq("id", exceptId);
  await q;
}

export async function createNewsArticle(form: FormData): Promise<{ error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const title = String(form.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

    const slugInput = String(form.get("slug") || "").trim();
    const baseSlug = slugify(slugInput || title);
    const slug = await nextUniqueSlug(supabase, baseSlug);

    const excerpt = String(form.get("excerpt") || "").trim();
    const bodyRaw = form.get("body");
    const body = typeof bodyRaw === "string" && bodyRaw.trim() ? bodyRaw.trim() : null;
    const category = String(form.get("category") || "development") as Category;
    const department_id = parseDepartmentIdField(form);
    const featured = form.get("featured") === "on";
    const image_url = String(form.get("image_url") || "").trim();
    if (!image_url) return { error: "Image URL is required." };
    const image_alt = String(form.get("image_alt") || "").trim();
    const external_url = String(form.get("external_url") || "").trim();
    const rawStatus = String(form.get("status") || "draft");
    const status: Status = rawStatus === "published" ? "published" : "draft";

    let published_at: string | null = parsePublishedAtField(form);
    if (status === "published" && !published_at) published_at = new Date().toISOString();
    if (status === "draft") published_at = null;

    const { data: maxRow } = await supabase
      .from("news_articles")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const sort_order = ((maxRow as { sort_order?: number })?.sort_order ?? 0) + 10;

    if (featured) await clearOtherFeatured(supabase);

    const { error } = await supabase.from("news_articles").insert({
      title,
      slug,
      excerpt,
      body,
      category,
      department_id,
      featured,
      image_url,
      image_alt,
      external_url,
      status,
      published_at,
      sort_order,
      created_by: user.id,
    });

    if (error) return { error: error.message };

    revalidatePath("/news");
    revalidatePath("/dashboard/news");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to save article." };
  }
}

export async function updateNewsArticle(
  articleId: string,
  form: FormData
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();

    const title = String(form.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

    const slugInput = String(form.get("slug") || "").trim();
    let baseSlug = slugify(slugInput || title);
    const slug = await nextUniqueSlug(supabase, baseSlug, articleId);

    const excerpt = String(form.get("excerpt") || "").trim();
    const bodyRaw = form.get("body");
    const body = typeof bodyRaw === "string" && bodyRaw.trim() ? bodyRaw.trim() : null;
    const category = String(form.get("category") || "development") as Category;
    const department_id = parseDepartmentIdField(form);
    const featured = form.get("featured") === "on";
    const image_url = String(form.get("image_url") || "").trim();
    if (!image_url) return { error: "Image URL is required." };
    const image_alt = String(form.get("image_alt") || "").trim();
    const external_url = String(form.get("external_url") || "").trim();
    const rawStatus = String(form.get("status") || "draft");
    const status: Status = rawStatus === "published" ? "published" : "draft";

    let published_at: string | null = parsePublishedAtField(form);
    if (status === "published" && !published_at) published_at = new Date().toISOString();
    if (status === "draft") published_at = null;

    if (featured) await clearOtherFeatured(supabase, articleId);

    const { error } = await supabase
      .from("news_articles")
      .update({
        title,
        slug,
        excerpt,
        body,
        category,
        department_id,
        featured,
        image_url,
        image_alt,
        external_url,
        status,
        published_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (error) return { error: error.message };

    revalidatePath("/news");
    revalidatePath("/dashboard/news");
    revalidatePath(`/dashboard/news/${articleId}`);
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to update article." };
  }
}

export async function deleteNewsArticle(articleId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("news_articles").delete().eq("id", articleId);
    if (error) return { error: error.message };
    revalidatePath("/news");
    revalidatePath("/dashboard/news");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to delete." };
  }
}

export async function updateNewsPageSettings(form: FormData): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const hero_eyebrow = String(form.get("hero_eyebrow") || "").trim();
    const hero_headline_prefix = String(form.get("hero_headline_prefix") || "").trim();
    const hero_headline_accent = String(form.get("hero_headline_accent") || "").trim();
    const hero_intro = String(form.get("hero_intro") || "").trim();
    const hero_image_url = String(form.get("hero_image_url") || "").trim() || null;
    const newsletter_title = String(form.get("newsletter_title") || "").trim();
    const newsletter_body = String(form.get("newsletter_body") || "").trim();

    const row = {
      id: 1 as const,
      hero_eyebrow,
      hero_headline_prefix,
      hero_headline_accent,
      hero_intro,
      hero_image_url,
      newsletter_title,
      newsletter_body,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("news_page_settings").upsert(row, { onConflict: "id" });

    if (error) return { error: error.message };
    revalidatePath("/news");
    revalidatePath("/dashboard/news");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to save settings." };
  }
}
