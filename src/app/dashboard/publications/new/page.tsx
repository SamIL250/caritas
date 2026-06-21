import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProgramDepartmentOptions } from "@/lib/program-departments";
import type { Database } from "@/types/database.types";
import PublicationForm from "../PublicationForm";

export default async function NewPublicationPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; duplicate?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};

  let duplicateFrom: Database["public"]["Tables"]["publications"]["Row"] | null = null;
  if (sp.duplicate) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("publications")
      .select("*")
      .eq("id", sp.duplicate)
      .maybeSingle();
    if (!data) notFound();
    duplicateFrom = data as Database["public"]["Tables"]["publications"]["Row"];
  }

  const supabase = await createClient();
  const [{ data: cats }, departments] = await Promise.all([
    supabase
      .from("publication_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true }),
    fetchProgramDepartmentOptions(supabase),
  ]);

  const categories =
    (cats ?? []) as Database["public"]["Tables"]["publication_categories"]["Row"][];

  return (
    <PublicationForm
      mode="create"
      categories={categories}
      departments={departments}
      initialCategorySlug={typeof sp.category === "string" ? sp.category : null}
      duplicateFrom={duplicateFrom}
    />
  );
}
