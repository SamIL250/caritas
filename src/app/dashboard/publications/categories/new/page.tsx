import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import PublicationCategoryForm from "@/components/dashboard/publications/PublicationCategoryForm";

export default async function NewPublicationCategoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ duplicate?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};

  let duplicateFrom: Database["public"]["Tables"]["publication_categories"]["Row"] | null = null;
  if (sp.duplicate) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("publication_categories")
      .select("*")
      .eq("id", sp.duplicate)
      .maybeSingle();
    if (!data) notFound();
    duplicateFrom = data as Database["public"]["Tables"]["publication_categories"]["Row"];
  }

  return (
    <div className="w-full max-w-full">
      <PublicationCategoryForm mode="create" duplicateFrom={duplicateFrom} />
    </div>
  );
}
