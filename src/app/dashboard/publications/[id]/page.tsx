import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProgramDepartmentOptions } from "@/lib/program-departments";
import { Copy } from "lucide-react";
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
    <div className="w-full max-w-full">
      <div className="flex justify-end">
        <Link
          href={`/dashboard/publications/new?duplicate=${pub.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#7A1515]"
        >
          <Copy size={13} aria-hidden />
          Duplicate this publication
        </Link>
      </div>
      <PublicationForm mode="edit" publication={pub} categories={categories} departments={departments} />
    </div>
  );
}
