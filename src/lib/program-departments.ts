import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type ProgramDepartmentOption = {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
};

/** Program pillars (Social Welfare, Health, …) — canonical department axis for news & publications. */
export async function fetchProgramDepartmentOptions(
  supabase: SupabaseClient<Database>,
): Promise<ProgramDepartmentOption[]> {
  const { data, error } = await supabase
    .from("program_categories")
    .select("id, slug, label, sort_order")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProgramDepartmentOption[];
}
