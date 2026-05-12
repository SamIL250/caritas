"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import type { Database, Json } from "@/types/database.types";

type EventStatus = Database["public"]["Enums"]["event_status"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

const STATUS_VALUES: EventStatus[] = ["draft", "published", "cancelled"];

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be signed in.");
  return { supabase, user };
}

async function nextUniqueEventSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  excludeId?: string,
): Promise<string> {
  const baseClean = base || "event";
  let candidate = baseClean;
  for (let n = 0; n < 40; n++) {
    const row = await supabase.from("events").select("id").eq("slug", candidate).maybeSingle();
    const id = row.data?.id as string | undefined;
    if (!id || (excludeId && id === excludeId)) return candidate;
    candidate = `${baseClean}-${n + 2}`;
  }
  return `${baseClean}-${Date.now()}`;
}

function parseDateTime(raw: FormDataEntryValue | null): string | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseGalleryImages(raw: FormDataEntryValue | null): Json {
  const s = String(raw || "").trim();
  if (!s) return [];
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed as Json;
  } catch {
    /* ignore */
  }
  return [];
}

function readCommonFields(form: FormData): {
  title: string;
  slugInput: string;
  status: EventStatus;
  starts_at: string | null;
  ends_at: string | null;
  is_all_day: boolean;
  base: Omit<EventInsert, "title" | "slug" | "starts_at"> & { description_html: string | null };
} {
  const title = String(form.get("title") || "").trim();
  const slugInput = String(form.get("slug") || "").trim();

  const statusRaw = String(form.get("status") || "draft") as EventStatus;
  const status = STATUS_VALUES.includes(statusRaw) ? statusRaw : "draft";

  const is_all_day = form.get("is_all_day") === "on";
  const starts_at = parseDateTime(form.get("starts_at"));
  const ends_at = parseDateTime(form.get("ends_at"));

  const summary = String(form.get("summary") || "").trim().slice(0, 1000);
  const descriptionRaw = String(form.get("description_html") || "").trim();
  const description_html = descriptionRaw ? descriptionRaw : null;

  const location_label = String(form.get("location_label") || "").trim().slice(0, 200);
  const location_address = String(form.get("location_address") || "").trim().slice(0, 500);
  const location_url = String(form.get("location_url") || "").trim().slice(0, 1000);
  const timezone = String(form.get("timezone") || "Africa/Kigali").trim().slice(0, 80) || "Africa/Kigali";
  const category_label = String(form.get("category_label") || "").trim().slice(0, 80);
  const featured_image_url = String(form.get("featured_image_url") || "").trim().slice(0, 2000);
  const image_alt = String(form.get("image_alt") || "").trim().slice(0, 300);
  const gallery_images = parseGalleryImages(form.get("gallery_images_json"));
  const registration_url = String(form.get("registration_url") || "").trim().slice(0, 1000);
  const capacity_label = String(form.get("capacity_label") || "").trim().slice(0, 100);
  const contact_email = String(form.get("contact_email") || "").trim().slice(0, 320);
  const contact_phone = String(form.get("contact_phone") || "").trim().slice(0, 80);
  const featured = form.get("featured") === "on";

  return {
    title,
    slugInput,
    status,
    starts_at,
    ends_at,
    is_all_day,
    base: {
      summary,
      description_html,
      location_label,
      location_address,
      location_url,
      ends_at,
      is_all_day,
      timezone,
      category_label,
      featured_image_url,
      image_alt,
      gallery_images,
      registration_url,
      capacity_label,
      contact_email,
      contact_phone,
      featured,
      status,
    },
  };
}

export async function createEvent(form: FormData): Promise<{ id?: string; error?: string }> {
  try {
    const { supabase, user } = await requireStaff();
    const fields = readCommonFields(form);

    if (!fields.title || fields.title.length < 2) return { error: "Title is required." };
    if (!fields.starts_at) return { error: "Start date/time is required." };
    if (fields.ends_at && new Date(fields.ends_at).getTime() < new Date(fields.starts_at).getTime()) {
      return { error: "End date/time cannot be before the start." };
    }

    const baseSlug = slugify(fields.slugInput || fields.title);
    const slug = await nextUniqueEventSlug(supabase, baseSlug);

    let published_at: string | null = parseDateTime(form.get("published_at_local"));
    if (fields.status === "published" && !published_at) published_at = new Date().toISOString();
    if (fields.status !== "published") published_at = null;

    const { data, error } = await supabase
      .from("events")
      .insert({
        ...fields.base,
        title: fields.title,
        slug,
        starts_at: fields.starts_at,
        published_at,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/dashboard/events");
    revalidatePath("/");
    return { id: (data as { id: string }).id };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to create event." };
  }
}

export async function updateEvent(eventId: string, form: FormData): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireStaff();
    const fields = readCommonFields(form);

    if (!fields.title || fields.title.length < 2) return { error: "Title is required." };
    if (!fields.starts_at) return { error: "Start date/time is required." };
    if (fields.ends_at && new Date(fields.ends_at).getTime() < new Date(fields.starts_at).getTime()) {
      return { error: "End date/time cannot be before the start." };
    }

    const baseSlug = slugify(fields.slugInput || fields.title);
    const slug = await nextUniqueEventSlug(supabase, baseSlug, eventId);

    let published_at: string | null = parseDateTime(form.get("published_at_local"));
    if (fields.status === "published" && !published_at) published_at = new Date().toISOString();
    if (fields.status !== "published") published_at = null;

    const updates: EventUpdate = {
      ...fields.base,
      title: fields.title,
      slug,
      starts_at: fields.starts_at,
      published_at,
    };

    const { error } = await supabase.from("events").update(updates).eq("id", eventId);
    if (error) return { error: error.message };

    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath("/");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to update event." };
  }
}

export async function deleteEvent(eventId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireStaff();
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/events");
    revalidatePath("/");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to delete event." };
  }
}
