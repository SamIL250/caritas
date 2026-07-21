import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import type { TestimonyRow } from "@/lib/testimonies";
import { TestimonyForm } from "../TestimonyForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditTestimonyPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("testimonies").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div className="w-full max-w-full">
      <Topbar title="Edit testimony" subtitle="Update title, excerpt, cover image, and rich text body." />
      <TestimonyForm mode="edit" testimony={data as TestimonyRow} />
    </div>
  );
}
