import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Campaigns",
  description:
    "Support Caritas Rwanda campaigns across medical care, education, livelihoods, and more.",
};

type CampaignRow = Database["public"]["Tables"]["community_campaigns"]["Row"];

export default async function CampaignsIndexPage() {
  const supabase = await createClient();
  const [{ data: campaigns }, { data: cats }] = await Promise.all([
    supabase
      .from("community_campaigns")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase.from("community_campaign_categories").select("id, name, slug"),
  ]);

  const rows = (campaigns ?? []) as CampaignRow[];
  const catMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c]));

  return (
    <div className="border-t border-stone-200 bg-stone-50/80 pb-16 pt-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8c2208]">
            Community campaigns
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Be part of the change
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Each campaign highlights people and programmes across Rwanda&apos;s nine dioceses. Open a story to read updates and leave an approved message for our team.
          </p>
        </header>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
            Published campaigns will appear here soon.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((c) => {
              const cat = catMap[c.category_id];
              return (
                <li key={c.id}>
                  <Link
                    href={`/campaigns/${c.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-colors hover:border-stone-300"
                  >
                    <div className="aspect-[16/10] bg-stone-200">
                      {c.featured_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- CMS-provided URLs
                        <img
                          src={c.featured_image_url}
                          alt={c.image_alt || ""}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      {cat ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c2208]">
                          {cat.name}
                        </span>
                      ) : null}
                      <h2 className="mt-2 font-[family-name:var(--font-poppins)] text-lg font-bold text-stone-900 group-hover:text-[#8c2208]">
                        {c.title}
                      </h2>
                      {(c.excerpt || "").trim() ? (
                        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-600">
                          {c.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#8c2208]">
                        View campaign
                        <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
