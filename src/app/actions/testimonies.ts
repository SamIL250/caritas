"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slugify";
import type { TestimonyStatus } from "@/lib/testimonies";
import type { Database } from "@/types/database.types";

type TestimonyUpdate = Database["public"]["Tables"]["testimonies"]["Update"];
type TestimonyInsert = Database["public"]["Tables"]["testimonies"]["Insert"];

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
  let candidate = base || "testimony";
  for (let n = 0; n < 30; n++) {
    const row = await supabase.from("testimonies").select("id").eq("slug", candidate).maybeSingle();
    const id = row.data?.id as string | undefined;
    if (!id || (excludeId && id === excludeId)) return candidate;
    candidate = `${base}-${n + 2}`;
  }
  return `${base}-${Date.now()}`;
}

function parseStatus(form: FormData): TestimonyStatus {
  const raw = String(form.get("status") || "draft");
  return raw === "published" ? "published" : "draft";
}

function revalidateTestimonyPaths(slug?: string) {
  revalidatePath("/publications");
  revalidatePath("/dashboard/publications");
  if (slug) revalidatePath(`/publications/testimonies/${slug}`);
}

export async function createTestimony(form: FormData): Promise<{ error?: string; id?: string }> {
  try {
    const { supabase, user } = await requireUser();
    const title = String(form.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

    const slugBase = slugify(String(form.get("slug") || "").trim() || title);
    const slug = await nextUniqueSlug(supabase, slugBase);
    const status = parseStatus(form);
    const publishedAt =
      parsePublishedAtField(form) ?? (status === "published" ? new Date().toISOString() : null);

    const { data, error } = await supabase
      .from("testimonies")
      .insert({
        title,
        slug,
        excerpt: String(form.get("excerpt") || "").trim(),
        body: String(form.get("body") || "").trim(),
        cover_image_url: String(form.get("cover_image_url") || "").trim(),
        cover_image_alt: String(form.get("cover_image_alt") || "").trim(),
        status,
        published_at: publishedAt,
        sort_order: Number(form.get("sort_order") || 0) || 0,
        created_by: user.id,
      } satisfies TestimonyInsert)
      .select("id, slug")
      .single();

    if (error) return { error: error.message };
    revalidateTestimonyPaths(data.slug);
    return { id: data.id as string };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create testimony." };
  }
}

export async function updateTestimony(
  id: string,
  form: FormData,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const title = String(form.get("title") || "").trim();
    if (!title) return { error: "Title is required." };

    const slugInput = String(form.get("slug") || "").trim();
    const slugBase = slugify(slugInput || title);
    const slug = await nextUniqueSlug(supabase, slugBase, id);
    const status = parseStatus(form);
    const publishedAt = parsePublishedAtField(form);

    const patch: TestimonyUpdate = {
      title,
      slug,
      excerpt: String(form.get("excerpt") || "").trim(),
      body: String(form.get("body") || "").trim(),
      cover_image_url: String(form.get("cover_image_url") || "").trim(),
      cover_image_alt: String(form.get("cover_image_alt") || "").trim(),
      status,
      sort_order: Number(form.get("sort_order") || 0) || 0,
    };

    if (publishedAt) {
      patch.published_at = publishedAt;
    } else if (status === "published") {
      const { data: existing } = await supabase
        .from("testimonies")
        .select("published_at")
        .eq("id", id)
        .maybeSingle();
      if (!existing?.published_at) patch.published_at = new Date().toISOString();
    }

    const { error } = await supabase.from("testimonies").update(patch).eq("id", id);
    if (error) return { error: error.message };
    revalidateTestimonyPaths(slug);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save testimony." };
  }
}

export async function deleteTestimony(id: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("testimonies").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidateTestimonyPaths();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not delete testimony." };
  }
}
