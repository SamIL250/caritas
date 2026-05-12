import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Prefer editing the News CMS page (`/dashboard/pages/:id`). */
export default async function NewsSettingsRedirectRoute() {
  const supabase = await createClient();
  const { data } = await supabase.from("pages").select("id").eq("slug", "news").maybeSingle();

  if (data?.id) redirect(`/dashboard/pages/${data.id}`);

  redirect("/dashboard/news");
}
