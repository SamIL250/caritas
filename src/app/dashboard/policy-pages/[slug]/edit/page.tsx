import React from 'react';
import { notFound } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { getPolicyPage } from '@/lib/policy-pages';
import { PolicyPageEditor } from './PolicyPageEditor';

export default async function PolicyPageEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPolicyPage(slug);
  if (!page) notFound();

  return (
    <div className="w-full max-w-full">
      <Topbar title={`Edit: ${page.title}`} subtitle={`/${page.slug}`} />
      <div className="mt-6 max-w-[820px]">
        <PolicyPageEditor page={page} />
      </div>
    </div>
  );
}
