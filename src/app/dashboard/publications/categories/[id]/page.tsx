import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Copy } from "lucide-react";
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
    <div className="w-full max-w-full">
      <div className="flex justify-end">
        <Link
          href={`/dashboard/publications/categories/new?duplicate=${category.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#7A1515]"
        >
          <Copy size={13} aria-hidden />
          Duplicate this category
        </Link>
      </div>
      <PublicationCategoryForm mode="edit" category={category} />
    </div>
  );
}
