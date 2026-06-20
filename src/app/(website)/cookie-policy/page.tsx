import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPolicyPage } from '@/lib/policy-pages';
import '../privacy-policy/policy-page.css';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Caritas Rwanda Cookie Policy — how we use cookies and similar technologies on our website.',
};

export default async function CookiePolicyPage() {
  const page = await getPolicyPage('cookie-policy');
  if (!page) notFound();

  return (
    <div className="policy-page">
      <div className="policy-page-hero">
        <div className="policy-page-hero-inner">
          <h1>{page.title}</h1>
          <p className="policy-page-date">Last updated: {new Date(page.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <div className="policy-page-content">
        <div className="policy-page-body" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </div>
  );
}
