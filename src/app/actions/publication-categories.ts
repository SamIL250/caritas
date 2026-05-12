"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database, Json } from "@/types/database.types";
import {
  PUBLICATION_FIELD_TYPES,
  type PublicationCategoryKind,
  type PublicationFieldDef,
  type PublicationFieldType,
} from "@/lib/publications";

type CategoryInsert = Database["public"]["Tables"]["publication_categories"]["Insert"];

const SLUG_RX = /^[a-z][a-z0-9_]*$/;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be signed in.");
  return { supabase, user };
}

function normaliseSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_\s-]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

function parseFieldSchemaFromForm(form: FormData): { error?: string; schema?: PublicationFieldDef[] } {
  const raw = form.get("field_schema_json");
  if (typeof raw !== "string" || !raw.trim()) return { schema: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Field schema is not valid JSON." };
  }
  if (!Array.isArray(parsed)) return { error: "Field schema must be a JSON array." };
  const out: PublicationFieldDef[] = [];
  const seen = new Set<string>();
  for (const it of parsed) {
    if (!it || typeof it !== "object" || Array.isArray(it)) continue;
    const o = it as Record<string, unknown>;
    const key = typeof o.key === "string" ? normaliseSlug(o.key) : "";
    const label = typeof o.label === "string" ? o.label.trim() : "";
    const type = (typeof o.type === "string" ? o.type : "text") as PublicationFieldType;
    if (!key) return { error: "Each field must have a key." };
    if (!label) return { error: `Field “${key}” needs a display label.` };
    if (!PUBLICATION_FIELD_TYPES.some((t) => t.value === type))
      return { error: `Unknown field type: ${type}` };
    if (seen.has(key)) return { error: `Duplicate field key: ${key}` };
    seen.add(key);
    const def: PublicationFieldDef = { key, label, type };
    if (o.required === true) def.required = true;
    if (typeof o.helper === "string" && o.helper.trim()) def.helper = o.helper.trim();
    if (typeof o.placeholder === "string" && o.placeholder.trim()) def.placeholder = o.placeholder.trim();
    if (Array.isArray(o.options)) {
      const opts = o.options
        .map((op) => {
          if (!op || typeof op !== "object" || Array.isArray(op)) return null;
          const oo = op as Record<string, unknown>;
          const value = typeof oo.value === "string" ? oo.value.trim() : "";
          const lbl = typeof oo.label === "string" && oo.label.trim() ? oo.label.trim() : value;
          return value ? { value, label: lbl } : null;
        })
        .filter((x): x is { value: string; label: string } => Boolean(x));
      if (opts.length) def.options = opts;
    }
    out.push(def);
  }
  return { schema: out };
}

function parseBehaviorFromForm(form: FormData): Json {
  const out: Record<string, Json> = {};
  const anchor = String(form.get("behavior_site_anchor") || "").trim();
  if (anchor) out.site_anchor = anchor.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (form.get("behavior_single_featured") === "on") out.single_featured = true;
  if (form.get("behavior_news_like") === "on") out.news_like = true;
  return out as Json;
}

export async function createPublicationCategory(form: FormData): Promise<{ error?: string }> {
  try {
    const { supabase, user } = await requireUser();

    const label = String(form.get("label") || "").trim();
    const pluralLabel = String(form.get("plural_label") || "").trim();
    const slugInput = String(form.get("slug") || "").trim();
    const slug = normaliseSlug(slugInput || label);

    if (!label) return { error: "Display name is required." };
    if (!slug || !SLUG_RX.test(slug))
      return { error: "Slug must start with a letter and use only a–z, 0–9 or underscores." };

    const description = String(form.get("description") || "").trim();
    const icon = String(form.get("icon") || "").trim() || "fa-solid fa-file-lines";
    const accent = String(form.get("accent") || "").trim() || "#7A1515";
    const kind = (String(form.get("kind") || "pdf") as PublicationCategoryKind) || "pdf";

    const fieldRes = parseFieldSchemaFromForm(form);
    if (fieldRes.error) return { error: fieldRes.error };

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
      kind,
      behavior: parseBehaviorFromForm(form),
      field_schema: (fieldRes.schema ?? []) as unknown as Json,
      sort_order,
      is_system: false,
      created_by: user.id,
    };

    const { error } = await supabase.from("publication_categories").insert(insert);
    if (error) {
      if (error.message.includes("publication_categories_slug_key"))
        return { error: `Slug “${slug}” is already used.` };
      return { error: error.message };
    }

    revalidatePath("/publications");
    revalidatePath("/dashboard/publications");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to create category." };
  }
}

export async function updatePublicationCategory(
  categoryId: string,
  form: FormData,
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const { data: existing } = await supabase
      .from("publication_categories")
      .select("*")
      .eq("id", categoryId)
      .maybeSingle();
    if (!existing) return { error: "Category not found." };

    const label = String(form.get("label") || existing.label || "").trim();
    const pluralLabel = String(form.get("plural_label") || existing.plural_label || "").trim();
    const description = String(form.get("description") || "").trim();
    const icon = String(form.get("icon") || existing.icon || "").trim() || "fa-solid fa-file-lines";
    const accent = String(form.get("accent") || existing.accent || "").trim() || "#7A1515";

    const sortOrderRaw = String(form.get("sort_order") || "").trim();
    const sortNum = sortOrderRaw === "" ? existing.sort_order : Number.parseInt(sortOrderRaw, 10);
    const sort_order = Number.isFinite(sortNum) ? sortNum : existing.sort_order;

    const fieldRes = parseFieldSchemaFromForm(form);
    if (fieldRes.error) return { error: fieldRes.error };

    const updates: Database["public"]["Tables"]["publication_categories"]["Update"] = {
      label,
      plural_label: pluralLabel || label,
      description,
      icon,
      accent,
      sort_order,
      behavior: parseBehaviorFromForm(form),
      field_schema: (fieldRes.schema ?? []) as unknown as Json,
    };

    if (!existing.is_system) {
      const slugInput = String(form.get("slug") || "").trim();
      const slug = normaliseSlug(slugInput || label);
      if (!slug || !SLUG_RX.test(slug))
        return { error: "Slug must start with a letter and use only a–z, 0–9 or underscores." };
      const kind = (String(form.get("kind") || existing.kind) as PublicationCategoryKind) || existing.kind;
      updates.slug = slug;
      updates.kind = kind;
    }

    const { error } = await supabase.from("publication_categories").update(updates).eq("id", categoryId);
    if (error) {
      if (error.message.includes("publication_categories_slug_key"))
        return { error: "That slug is already used by another category." };
      return { error: error.message };
    }

    revalidatePath("/publications");
    revalidatePath("/dashboard/publications");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to update category." };
  }
}

export async function deletePublicationCategory(categoryId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireUser();
    const { data: cat } = await supabase
      .from("publication_categories")
      .select("id, is_system")
      .eq("id", categoryId)
      .maybeSingle();
    if (!cat) return { error: "Category not found." };
    if (cat.is_system) return { error: "Built-in categories can't be removed." };

    const { count } = await supabase
      .from("publications")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);
    if ((count ?? 0) > 0)
      return { error: "Reassign or delete publications in this category first." };

    const { error } = await supabase.from("publication_categories").delete().eq("id", categoryId);
    if (error) return { error: error.message };

    revalidatePath("/publications");
    revalidatePath("/dashboard/publications");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to delete category." };
  }
}
