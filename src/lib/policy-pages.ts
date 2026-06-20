import { createClient } from '@/lib/supabase/server';
import { parsePolicyPage, type PolicyPage } from '@/lib/cookie-consent';

export async function getPolicyPage(slug: string): Promise<PolicyPage | null> {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('policy_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return data ? parsePolicyPage(data) : null;
}

export async function getAllPolicyPages(): Promise<PolicyPage[]> {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('policy_pages')
    .select('*')
    .order('slug');
  return (data || []).map(parsePolicyPage);
}
