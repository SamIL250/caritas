import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProgramDepartmentOptions } from "@/lib/program-departments";
import type { Database } from "@/types/database.types";
import PublicationForm from "../PublicationForm";

export default async function EditPublicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: row }, { data: cats }, departments] = await Promise.all([
    supabase.from("publications").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("publication_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true }),
    fetchProgramDepartmentOptions(supabase),
  ]);

  if (!row) notFound();

  const pub = row as Database["public"]["Tables"]["publications"]["Row"];
  const categories =
    (cats ?? []) as Database["public"]["Tables"]["publication_categories"]["Row"][];

  return (
    <PublicationForm mode="edit" publication={pub} categories={categories} departments={departments} />
  );
}
