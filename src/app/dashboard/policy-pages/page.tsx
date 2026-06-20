import React from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/Topbar';
import { getAllPolicyPages } from '@/lib/policy-pages';
import { FileText, ExternalLink } from 'lucide-react';

export default async function PolicyPagesListPage() {
  const pages = await getAllPolicyPages();

  return (
    <div className="w-full max-w-full">
      <Topbar title="Policy Pages" subtitle="Edit your Privacy Policy and Cookie Policy content" />

      <div className="mt-6 grid gap-4 max-w-2xl">
        {pages.map((p) => (
          <div key={p.id} className="rounded-xl border border-stone-100 bg-white p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7A1515]/5 flex items-center justify-center text-[#7A1515]">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-800">{p.title}</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  /{p.slug} &middot; Last updated: {new Date(p.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/${p.slug}`}
                target="_blank"
                className="p-2 text-stone-400 hover:text-[#7A1515] transition-colors"
                title="View public page"
              >
                <ExternalLink size={16} />
              </Link>
              <Link
                href={`/dashboard/policy-pages/${p.slug}/edit`}
                className="px-4 py-2 bg-[#7A1515] text-white text-xs font-bold rounded-lg hover:bg-[#5e1010] transition-colors"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
