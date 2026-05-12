"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database, Json } from "@/types/database.types";
import { slugify } from "@/lib/news";
import { readCategoryBehavior, readFieldSchema } from "@/lib/publications";

type Status = Database["public"]["Enums"]["publication_status"];

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
  excludeId?: string,
): Promise<string> {
  let candidate = base || "publication";
  for (let n = 0; n < 30; n++) {
    const row = await supabase.from("publications").select("id").eq("slug", candidate).maybeSingle();
    const id = row.data?.id as string | undefined;
    if (!id || (excludeId && id === excludeId)) return candidate;
    candidate = `${base}-${n + 2}`;
  }
  return `${base}-${Date.now()}`;
}

async function clearOtherFeaturedInCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryId: string,
  exceptId?: string,
) {
  let q = supabase
    .from("publications")
    .update({ featured: false })
    .eq("featured", true)
    .eq("category_id", categoryId);
  if (exceptId) q = q.neq("id", exceptId);
  await q;
}

async function loadCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryId: string,
) {
  const { data, error } = await supabase
    .from("publication_categories")
    .select("*")
    .eq("id", categoryId)
    .maybeSingle();
  if (error || !data) {
    throw new Error("The selected publication type no longer exists.");
  }
  return data;
}

function parseCustomFieldsFromForm(
  form: FormData,
  schema: ReturnType<typeof readFieldSchema>,
): Record<string, Json> {
  const out: Record<string, Json> = {};
  for (const f of schema) {
    const name = `custom__${f.key}`;
    if (f.type === "checkbox") {
      out[f.key] = form.get(name) === "on";
      continue;
    }
    const raw = form.get(name);
    if (typeof raw !== "string") {
      out[f.key] = "";
      continue;
    }
    if (f.type === "number") {
      const trimmed = raw.trim();
      out[f.key] = trimmed === "" ? null : Number(trimmed);
    } else {
      out[f.key] = raw;
    }
  }
  return out;
}

export async function createPublication(form: FormData): Promise<{ error?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const title = String(form.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

    const category_id = String(form.get("category_id") || "").trim();
    if (!category_id) return { error: "Choose a publication type." };

    const cat = await loadCategory(supabase, category_id);
    const behavior = readCategoryBehavior(cat);
    const schema = readFieldSchema(cat);

    const slugInput = String(form.get("slug") || "").trim();
    const baseSlug = slugify(slugInput || title);
    const slug = await nextUniqueSlug(supabase, baseSlug);

    const excerpt = String(form.get("excerpt") || "").trim();
    const bodyRaw = form.get("body");
    const body = typeof bodyRaw === "string" && bodyRaw.trim() ? bodyRaw.trim() : null;
    const cover_image_url = String(form.get("cover_image_url") || "").trim();
    const cover_image_alt = String(form.get("cover_image_alt") || "").trim();
    const file_url = String(form.get("file_url") || "").trim();
    const external_url = String(form.get("external_url") || "").trim();
    const meta_line = String(form.get("meta_line") || "").trim();
    const period_label = String(form.get("period_label") || "").trim();
    const tag_label = String(form.get("tag_label") || "").trim();
    const tag_icon = String(form.get("tag_icon") || "").trim();
    const featured = form.get("featured") === "on";
    const status = (String(form.get("status") || "draft") as Status) === "published" ? "published" : "draft";
    const department_id = parseDepartmentIdField(form);

    let published_at: string | null = parsePublishedAtField(form);
    if (status === "published" && !published_at) published_at = new Date().toISOString();
    if (status === "draft") published_at = null;

    const { data: maxRow } = await supabase
      .from("publications")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const sort_order = ((maxRow as { sort_order?: number })?.sort_order ?? 0) + 10;

    if (featured && behavior.single_featured) {
      await clearOtherFeaturedInCategory(supabase, category_id);
    }

    const custom_fields = parseCustomFieldsFromForm(form, schema);

    const { error } = await supabase.from("publications").insert({
      title,
      slug,
      category_id,
      department_id,
      excerpt,
      body,
      cover_image_url,
      cover_image_alt,
      file_url,
      external_url,
      meta_line,
      period_label,
      tag_label,
      tag_icon,
      featured,
      status,
      published_at,
      sort_order,
      custom_fields: custom_fields as Json,
      created_by: user.id,
    });

    if (error) return { error: error.message };

    revalidatePath("/publications");
    revalidatePath("/dashboard/publications");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to save publication." };
  }
}

export async function updatePublication(
  publicationId: string,
  form: FormData,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();

    const title = String(form.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

    const category_id = String(form.get("category_id") || "").trim();
    if (!category_id) return { error: "Choose a publication type." };

    const cat = await loadCategory(supabase, category_id);
    const behavior = readCategoryBehavior(cat);
    const schema = readFieldSchema(cat);

    const slugInput = String(form.get("slug") || "").trim();
    const baseSlug = slugify(slugInput || title);
    const slug = await nextUniqueSlug(supabase, baseSlug, publicationId);

    const excerpt = String(form.get("excerpt") || "").trim();
    const bodyRaw = form.get("body");
    const body = typeof bodyRaw === "string" && bodyRaw.trim() ? bodyRaw.trim() : null;
    const cover_image_url = String(form.get("cover_image_url") || "").trim();
    const cover_image_alt = String(form.get("cover_image_alt") || "").trim();
    const file_url = String(form.get("file_url") || "").trim();
    const external_url = String(form.get("external_url") || "").trim();
    const meta_line = String(form.get("meta_line") || "").trim();
    const period_label = String(form.get("period_label") || "").trim();
    const tag_label = String(form.get("tag_label") || "").trim();
    const tag_icon = String(form.get("tag_icon") || "").trim();
    const featured = form.get("featured") === "on";
    const status = (String(form.get("status") || "draft") as Status) === "published" ? "published" : "draft";
    const department_id = parseDepartmentIdField(form);

    let published_at: string | null = parsePublishedAtField(form);
    if (status === "published" && !published_at) published_at = new Date().toISOString();
    if (status === "draft") published_at = null;

    if (featured && behavior.single_featured) {
      await clearOtherFeaturedInCategory(supabase, category_id, publicationId);
    }

    const custom_fields = parseCustomFieldsFromForm(form, schema);

    const { error } = await supabase
      .from("publications")
      .update({
        title,
        slug,
        category_id,
        department_id,
        excerpt,
        body,
        cover_image_url,
        cover_image_alt,
        file_url,
        external_url,
        meta_line,
        period_label,
        tag_label,
        tag_icon,
        featured,
        status,
        published_at,
        custom_fields: custom_fields as Json,
      })
      .eq("id", publicationId);

    if (error) return { error: error.message };

    revalidatePath("/publications");
    revalidatePath("/dashboard/publications");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to update publication." };
  }
}

export async function deletePublication(publicationId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("publications").delete().eq("id", publicationId);
    if (error) return { error: error.message };
    revalidatePath("/publications");
    revalidatePath("/dashboard/publications");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to delete." };
  }
}
