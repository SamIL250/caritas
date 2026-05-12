import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { PageCard } from "@/components/pages/PageCard";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Pages - Caritas Rwanda CMS",
};

export default async function PagesPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase.from('pages').select('*').order('created_at', { ascending: false });

  return (
    <div className="w-full">
      <Topbar 
        title="Pages" 
        actions={
          <Button className="h-9 px-4">
            <Plus size={16} className="mr-2" />
            New Page
          </Button>
        } 
      />
      <div className="mt-2 sm:mt-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {pages && pages.length > 0 ? pages.map((page: any) => (
            <PageCard 
              key={page.id} 
              id={page.id}
              title={page.title}
              slug={page.slug}
              status={page.status as "published" | "draft"}
              lastUpdated={new Date(page.updated_at).toLocaleDateString()}
            />
          )) : (
            <p className="col-span-full text-stone-500">No pages found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
