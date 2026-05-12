import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import PublicationCategoryForm from "@/components/dashboard/publications/PublicationCategoryForm";

export default async function EditPublicationCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("publication_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  const category =
    row as Database["public"]["Tables"]["publication_categories"]["Row"];

  return (
    <div className="w-full max-w-5xl">
      <PublicationCategoryForm mode="edit" category={category} />
    </div>
  );
}
