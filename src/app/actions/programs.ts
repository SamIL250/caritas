"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database.types";
import { sanitizeStaffRichText } from "@/lib/sanitize-staff-html";
import { slugifyProgram } from "@/lib/programs";

type Status = Database["public"]["Enums"]["program_status"];

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

async function nextUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  excludeId?: string,
): Promise<string> {
  let candidate = base || "program";
  for (let n = 0; n < 30; n++) {
    const row = await supabase.from("programs").select("id").eq("slug", candidate).maybeSingle();
    const id = row.data?.id as string | undefined;
    if (!id || (excludeId && id === excludeId)) return candidate;
    candidate = `${base}-${n + 2}`;
  }
  return `${base}-${Date.now()}`;
}

async function ensureCategoryExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryId: string,
) {
  const { data, error } = await supabase
    .from("program_categories")
    .select("id, slug")
    .eq("id", categoryId)
    .maybeSingle();
  if (error || !data) throw new Error("The selected program category no longer exists.");
  return data;
}

export async function createProgram(form: FormData): Promise<{ error?: string; id?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const title = String(form.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

    const category_id = String(form.get("category_id") || "").trim();
    if (!category_id) return { error: "Choose a program category." };

    await ensureCategoryExists(supabase, category_id);

    const slugInput = String(form.get("slug") || "").trim();
    const baseSlug = slugifyProgram(slugInput || title);
    const slug = await nextUniqueSlug(supabase, baseSlug);

    const excerpt = String(form.get("excerpt") || "").trim();
    const bodyRaw = form.get("body");
    const bodyClean =
      typeof bodyRaw === "string" && bodyRaw.trim() ? sanitizeStaffRichText(bodyRaw) : null;

    const cover_image_url = String(form.get("cover_image_url") || "").trim();
    const cover_image_alt = String(form.get("cover_image_alt") || "").trim();
    const external_url = String(form.get("external_url") || "").trim();
    const tag_label = String(form.get("tag_label") || "").trim();
    const tag_icon = String(form.get("tag_icon") || "").trim();
    const featured = form.get("featured") === "on";
    const status: Status = String(form.get("status") || "draft") === "published" ? "published" : "draft";

    let published_at: string | null = parsePublishedAtField(form);
    if (status === "published" && !published_at) published_at = new Date().toISOString();
    if (status === "draft") published_at = null;

    const { data: maxRow } = await supabase
      .from("programs")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const sort_order = ((maxRow as { sort_order?: number })?.sort_order ?? 0) + 10;

    const { data, error } = await supabase
      .from("programs")
      .insert({
        title,
        slug,
        category_id,
        excerpt,
        body: bodyClean,
        cover_image_url,
        cover_image_alt,
        external_url,
        tag_label,
        tag_icon,
        featured,
        status,
        published_at,
        sort_order,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/programs");
    revalidatePath(`/programs/${slug}`);
    revalidatePath("/dashboard/programs");
    return { id: (data as { id: string }).id };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to save program." };
  }
}

export async function updateProgram(
  programId: string,
  form: FormData,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();

    const title = String(form.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

    const category_id = String(form.get("category_id") || "").trim();
    if (!category_id) return { error: "Choose a program category." };

    await ensureCategoryExists(supabase, category_id);

    const slugInput = String(form.get("slug") || "").trim();
    const baseSlug = slugifyProgram(slugInput || title);
    const slug = await nextUniqueSlug(supabase, baseSlug, programId);

    const excerpt = String(form.get("excerpt") || "").trim();
    const bodyRaw = form.get("body");
    const bodyClean =
      typeof bodyRaw === "string" && bodyRaw.trim() ? sanitizeStaffRichText(bodyRaw) : null;

    const cover_image_url = String(form.get("cover_image_url") || "").trim();
    const cover_image_alt = String(form.get("cover_image_alt") || "").trim();
    const external_url = String(form.get("external_url") || "").trim();
    const tag_label = String(form.get("tag_label") || "").trim();
    const tag_icon = String(form.get("tag_icon") || "").trim();
    const featured = form.get("featured") === "on";
    const status: Status = String(form.get("status") || "draft") === "published" ? "published" : "draft";

    let published_at: string | null = parsePublishedAtField(form);
    if (status === "published" && !published_at) published_at = new Date().toISOString();
    if (status === "draft") published_at = null;

    const { error } = await supabase
      .from("programs")
      .update({
        title,
        slug,
        category_id,
        excerpt,
        body: bodyClean,
        cover_image_url,
        cover_image_alt,
        external_url,
        tag_label,
        tag_icon,
        featured,
        status,
        published_at,
      })
      .eq("id", programId);

    if (error) return { error: error.message };

    revalidatePath("/programs");
    revalidatePath(`/programs/${slug}`);
    revalidatePath("/dashboard/programs");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to update program." };
  }
}

export async function deleteProgram(programId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("programs").delete().eq("id", programId);
    if (error) return { error: error.message };
    revalidatePath("/programs");
    revalidatePath("/dashboard/programs");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to delete." };
  }
}
