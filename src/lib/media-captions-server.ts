import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { mediaCaptionLookupKey } from "@/lib/media-captions";

function registerCaptionKey(map: Map<string, string>, key: string, caption: string) {
  const normalized = mediaCaptionLookupKey(key);
  if (!normalized) return;
  map.set(normalized, caption);
  map.set(key.trim(), caption);
}

/** All media captions for the current request (deduped via React cache). */
export const loadAllMediaCaptions = cache(async (): Promise<Map<string, string>> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .select("url, storage_path, caption")
    .is("deleted_at", null);

  if (error) throw new Error(error.message);

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const caption = row.caption?.trim();
    if (!caption) continue;
    registerCaptionKey(map, row.url, caption);
    if (row.storage_path) registerCaptionKey(map, row.storage_path, caption);
  }
  return map;
});
