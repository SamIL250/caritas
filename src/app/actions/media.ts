"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MEDIA_QUOTA_BYTES } from "@/lib/media-quota";
import type { Database } from "@/types/database.types";

export type MediaRow = Database["public"]["Tables"]["media"]["Row"];
export type MediaFolderRow = Database["public"]["Tables"]["media_folders"]["Row"];

export async function getMediaUsage(): Promise<{ usedBytes: number; maxBytes: number }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("media").select("size_bytes").is("deleted_at", null);

  if (error) throw new Error(error.message);

  const usedBytes =
    data?.reduce((sum, row) => sum + (typeof row.size_bytes === "number" ? row.size_bytes : 0), 0) ?? 0;

  return { usedBytes, maxBytes: MEDIA_QUOTA_BYTES };
}

/** Flat list for library navigation & breadcrumbs (non-trash folders only). */
export async function listMediaFolders(): Promise<MediaFolderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_folders")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as MediaFolderRow[];
}

export async function getMedia(options?: {
  folderId?: string | null;
  trash?: boolean;
}): Promise<MediaRow[]> {
  const supabase = await createClient();
  let q = supabase.from("media").select("*").order("created_at", { ascending: false });

  if (options?.trash) {
    q = q.not("deleted_at", "is", null);
  } else {
    q = q.is("deleted_at", null);
    if (options?.folderId !== undefined) {
      if (options.folderId === null) {
        q = q.is("folder_id", null);
      } else {
        q = q.eq("folder_id", options.folderId);
      }
    }
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as MediaRow[];
}

export async function uploadMedia(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  const usage = await getMediaUsage();
  if (usage.usedBytes + file.size > usage.maxBytes) {
    throw new Error(
      `Storage limit reached (${Math.round(usage.maxBytes / (1024 * 1024))} MB budget). Delete or restore items before uploading.`,
    );
  }

  const folderRaw = formData.get("folder_id");
  const folder_id =
    typeof folderRaw === "string" && folderRaw.length > 0 ? folderRaw : null;

  const filename = file.name;
  const fileExt = filename.split(".").pop();
  const filePath = `${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("public_media").upload(filePath, file);

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("public_media").getPublicUrl(filePath);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const row = {
    filename,
    storage_path: filePath,
    url: publicUrl,
    size_bytes: file.size,
    mime_type: file.type,
    uploaded_by: user?.id ?? null,
    folder_id,
    deleted_at: null as string | null,
  };

  const { data: mediaData, error: mediaError } = await supabase
    .from("media")
    .insert(row)
    .select()
    .single();

  if (mediaError) throw new Error(mediaError.message);

  revalidatePath("/dashboard/media");
  return mediaData as MediaRow;
}

export async function createMediaFolder(name: string, parentId: string | null) {
  const supabase = await createClient();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Folder name is required.");

  const { data, error } = await supabase
    .from("media_folders")
    .insert({ name: trimmed, parent_id: parentId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/media");
  return data as MediaFolderRow;
}

export async function renameMediaFolder(folderId: string, name: string) {
  const supabase = await createClient();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Folder name is required.");

  const { error } = await supabase.from("media_folders").update({ name: trimmed }).eq("id", folderId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/media");
}

export async function renameMediaFile(mediaId: string, filename: string) {
  const supabase = await createClient();
  const trimmed = filename.trim();
  if (!trimmed) throw new Error("Filename is required.");

  const { error } = await supabase.from("media").update({ filename: trimmed }).eq("id", mediaId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/media");
}

export async function moveMediaToFolder(mediaId: string, folderId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("media").update({ folder_id: folderId }).eq("id", mediaId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/media");
}

export async function softDeleteMedia(mediaId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("media")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", mediaId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/media");
}

export async function restoreMedia(mediaId: string, folderId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("media")
    .update({ deleted_at: null, folder_id: folderId })
    .eq("id", mediaId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/media");
}

export async function purgeMedia(mediaId: string) {
  const supabase = await createClient();

  const { data: row, error: fetchErr } = await supabase
    .from("media")
    .select("storage_path")
    .eq("id", mediaId)
    .maybeSingle();

  if (fetchErr) throw new Error(fetchErr.message);
  if (!row?.storage_path) throw new Error("Media not found.");

  const { error: storageErr } = await supabase.storage.from("public_media").remove([row.storage_path]);

  if (storageErr) throw new Error(storageErr.message);

  const { error: delErr } = await supabase.from("media").delete().eq("id", mediaId);

  if (delErr) throw new Error(delErr.message);
  revalidatePath("/dashboard/media");
}

export async function deleteMediaFolder(folderId: string) {
  const supabase = await createClient();

  const { count: childFolders, error: cErr } = await supabase
    .from("media_folders")
    .select("*", { count: "exact", head: true })
    .eq("parent_id", folderId);

  if (cErr) throw new Error(cErr.message);
  if ((childFolders ?? 0) > 0) {
    throw new Error("Remove or rename subfolders before deleting this folder.");
  }

  const { count: files, error: mErr } = await supabase
    .from("media")
    .select("*", { count: "exact", head: true })
    .eq("folder_id", folderId)
    .is("deleted_at", null);

  if (mErr) throw new Error(mErr.message);
  if ((files ?? 0) > 0) {
    throw new Error("Move or delete files inside this folder before deleting it.");
  }

  const { error } = await supabase.from("media_folders").delete().eq("id", folderId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/media");
}
