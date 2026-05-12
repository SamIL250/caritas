"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database.types";
import { slugifyCategorySlug } from "@/lib/programs";

type CategoryInsert = Database["public"]["Tables"]["program_categories"]["Insert"];

const SLUG_RX = /^[a-z][a-z0-9_-]*$/;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be signed in.");
  return { supabase, user };
}

export async function createProgramCategory(form: FormData): Promise<{ error?: string }> {
  try {
    const { supabase, user } = await requireUser();

    const label = String(form.get("label") || "").trim();
    if (!label) return { error: "Display name is required." };

    const slugInput = String(form.get("slug") || "").trim();
    const slug = slugifyCategorySlug(slugInput || label);
    if (!slug || !SLUG_RX.test(slug))
      return { error: "Slug must start with a letter and contain only a–z, 0–9, '-' or '_'." };

    const pluralLabel = String(form.get("plural_label") || "").trim();
    const description = String(form.get("description") || "").trim();
    const icon = String(form.get("icon") || "").trim() || "fa-solid fa-folder";
    const accent = String(form.get("accent") || "").trim() || "#7A1515";
    const cover_image_url = String(form.get("cover_image_url") || "").trim();

    const sortOrderRaw = String(form.get("sort_order") || "").trim();
    const sortNum = sortOrderRaw === "" ? 100 : Number.parseInt(sortOrderRaw, 10);
    const sort_order = Number.isFinite(sortNum) ? sortNum : 100;

    const insert: CategoryInsert = {
      slug,
      label,
      plural_label: pluralLabel || label,
      description,
      icon,
      accent,
      cover_image_url,
      sort_order,
      is_system: false,
      created_by: user.id,
    };

    const { error } = await supabase.from("program_categories").insert(insert);
    if (error) {
      if (error.message.toLowerCase().includes("program_categories_slug"))
        return { error: `Slug “${slug}” is already used.` };
      return { error: error.message };
    }

    revalidatePath("/programs");
    revalidatePath("/dashboard/programs");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to create category." };
  }
}

export async function updateProgramCategory(
  categoryId: string,
  form: FormData,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const { data: existing } = await supabase
      .from("program_categories")
      .select("*")
      .eq("id", categoryId)
      .maybeSingle();
    if (!existing) return { error: "Category not found." };

    const label = String(form.get("label") || existing.label || "").trim();
    const pluralLabel = String(form.get("plural_label") || existing.plural_label || "").trim();
    const description = String(form.get("description") || "").trim();
    const icon = String(form.get("icon") || existing.icon || "").trim() || "fa-solid fa-folder";
    const accent = String(form.get("accent") || existing.accent || "").trim() || "#7A1515";
    const cover_image_url = String(form.get("cover_image_url") || "").trim();

    const sortOrderRaw = String(form.get("sort_order") || "").trim();
    const sortNum = sortOrderRaw === "" ? existing.sort_order : Number.parseInt(sortOrderRaw, 10);
    const sort_order = Number.isFinite(sortNum) ? sortNum : existing.sort_order;

    const updates: Database["public"]["Tables"]["program_categories"]["Update"] = {
      label,
      plural_label: pluralLabel || label,
      description,
      icon,
      accent,
      cover_image_url,
      sort_order,
    };

    if (!existing.is_system) {
      const slugInput = String(form.get("slug") || "").trim();
      const slug = slugifyCategorySlug(slugInput || label);
      if (!slug || !SLUG_RX.test(slug))
        return { error: "Slug must start with a letter and contain only a–z, 0–9, '-' or '_'." };
      updates.slug = slug;
    }

    const { error } = await supabase
      .from("program_categories")
      .update(updates)
      .eq("id", categoryId);
    if (error) {
      if (error.message.toLowerCase().includes("program_categories_slug"))
        return { error: "That slug is already used by another category." };
      return { error: error.message };
    }

    revalidatePath("/programs");
    revalidatePath("/dashboard/programs");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to update category." };
  }
}

export async function deleteProgramCategory(categoryId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const { data: cat } = await supabase
      .from("program_categories")
      .select("id, is_system")
      .eq("id", categoryId)
      .maybeSingle();
    if (!cat) return { error: "Category not found." };
    if (cat.is_system) return { error: "Built-in categories can't be removed." };

    const { count } = await supabase
      .from("programs")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);
    if ((count ?? 0) > 0)
      return { error: "Reassign or delete programs in this category first." };

    const { error } = await supabase.from("program_categories").delete().eq("id", categoryId);
    if (error) return { error: error.message };

    revalidatePath("/programs");
    revalidatePath("/dashboard/programs");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to delete category." };
  }
}
