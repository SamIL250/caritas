"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database.types";
import { sanitizeStaffRichText } from "@/lib/sanitize-staff-html";
import { slugifyProgram } from "@/lib/programs";

type Status = Database["public"]["Enums"]["program_status"];

export type ProgramBubbleDraft = {
  title: string;
  subtitle: string;
  excerpt: string;
  project_period: string;
  carried_by: string;
  cover_image_url: string;
};

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

function readProgramFields(form: FormData) {
  return {
    title: String(form.get("title") || "").trim(),
    excerpt: String(form.get("excerpt") || "").trim(),
    bodyRaw: form.get("body"),
    cover_image_url: String(form.get("cover_image_url") || "").trim(),
    cover_image_alt: String(form.get("cover_image_alt") || "").trim(),
    external_url: String(form.get("external_url") || "").trim(),
    subtitle: String(form.get("subtitle") || "").trim(),
    location: String(form.get("location") || "").trim(),
    contact_phone: String(form.get("contact_phone") || "").trim(),
    tag_label: String(form.get("tag_label") || "").trim(),
    tag_icon: String(form.get("tag_icon") || "").trim(),
    project_period: String(form.get("project_period") || "").trim(),
    carried_by: String(form.get("carried_by") || "").trim(),
    featured: form.get("featured") === "on",
    status: (String(form.get("status") || "draft") === "published" ? "published" : "draft") as Status,
  };
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
    const fields = readProgramFields(form);
    if (!fields.title) return { error: "Title is required." };

    const category_id = String(form.get("category_id") || "").trim();
    if (!category_id) return { error: "Choose a program category." };

    await ensureCategoryExists(supabase, category_id);

    const slugInput = String(form.get("slug") || "").trim();
    const baseSlug = slugifyProgram(slugInput || fields.title);
    const slug = await nextUniqueSlug(supabase, baseSlug);

    const bodyClean =
      typeof fields.bodyRaw === "string" && fields.bodyRaw.trim()
        ? sanitizeStaffRichText(fields.bodyRaw)
        : null;

    let published_at: string | null = parsePublishedAtField(form);
    if (fields.status === "published" && !published_at) published_at = new Date().toISOString();
    if (fields.status === "draft") published_at = null;

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
        title: fields.title,
        slug,
        category_id,
        excerpt: fields.excerpt,
        body: bodyClean,
        cover_image_url: fields.cover_image_url,
        cover_image_alt: fields.cover_image_alt,
        external_url: fields.external_url,
        subtitle: fields.subtitle,
        location: fields.location,
        contact_phone: fields.contact_phone,
        tag_label: fields.tag_label,
        tag_icon: fields.tag_icon,
        project_period: fields.project_period,
        carried_by: fields.carried_by,
        featured: fields.featured,
        status: fields.status,
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
    const fields = readProgramFields(form);
    if (!fields.title) return { error: "Title is required." };

    const category_id = String(form.get("category_id") || "").trim();
    if (!category_id) return { error: "Choose a program category." };

    await ensureCategoryExists(supabase, category_id);

    const slugInput = String(form.get("slug") || "").trim();
    const baseSlug = slugifyProgram(slugInput || fields.title);
    const slug = await nextUniqueSlug(supabase, baseSlug, programId);

    const bodyClean =
      typeof fields.bodyRaw === "string" && fields.bodyRaw.trim()
        ? sanitizeStaffRichText(fields.bodyRaw)
        : null;

    let published_at: string | null = parsePublishedAtField(form);
    if (fields.status === "published" && !published_at) published_at = new Date().toISOString();
    if (fields.status === "draft") published_at = null;

    const { error } = await supabase
      .from("programs")
      .update({
        title: fields.title,
        slug,
        category_id,
        excerpt: fields.excerpt,
        body: bodyClean,
        cover_image_url: fields.cover_image_url,
        cover_image_alt: fields.cover_image_alt,
        external_url: fields.external_url,
        subtitle: fields.subtitle,
        location: fields.location,
        contact_phone: fields.contact_phone,
        tag_label: fields.tag_label,
        tag_icon: fields.tag_icon,
        project_period: fields.project_period,
        carried_by: fields.carried_by,
        featured: fields.featured,
        status: fields.status,
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

export async function saveProgramBubbleDrafts(
  drafts: Record<string, ProgramBubbleDraft>,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const entries = Object.entries(drafts);
    if (!entries.length) return {};

    for (const [programId, draft] of entries) {
      const title = draft.title.trim();
      if (!title) return { error: "Every program bubble needs a title." };

      const { error } = await supabase
        .from("programs")
        .update({
          title,
          subtitle: draft.subtitle.trim(),
          excerpt: draft.excerpt.trim(),
          project_period: draft.project_period.trim(),
          carried_by: draft.carried_by.trim(),
          cover_image_url: draft.cover_image_url.trim(),
        })
        .eq("id", programId);

      if (error) return { error: error.message };
    }

    revalidatePath("/programs");
    revalidatePath("/dashboard/programs");
    revalidatePath("/dashboard/pages");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to save bubble content." };
  }
}
