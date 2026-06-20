'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updatePolicyPage(slug: string, payload: { title: string; content: string }) {
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from('policy_pages')
    .update({
      title: payload.title,
      content: payload.content,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug);

  if (error) return { error: error.message, success: false as const };

  revalidatePath(`/${slug}`);
  revalidatePath(`/dashboard/policy-pages/${slug}/edit`);
  revalidatePath('/dashboard/policy-pages');
  return { success: true as const };
}
