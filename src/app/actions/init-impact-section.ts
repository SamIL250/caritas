'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { DEFAULT_SECTION_CONTENT } from '@/lib/constants';

/**
 * Ensures the home page has an editable Impact at a Glance card section.
 * Prefers copying content from the metrics page when available.
 */
export async function ensureHomeImpactAtGlanceSection(pageId: string) {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('sections')
    .select('id')
    .eq('page_id', pageId)
    .eq('type', 'impact_at_glance')
    .maybeSingle();

  if (existing?.id) return;

  let content: Record<string, unknown> =
    (DEFAULT_SECTION_CONTENT.impact_at_glance as Record<string, unknown>) || {};

  const { data: metricsPage } = await supabase
    .from('pages')
    .select('id')
    .eq('slug', 'metrics')
    .maybeSingle();

  if (metricsPage?.id) {
    const { data: metricsImpact } = await supabase
      .from('sections')
      .select('content')
      .eq('page_id', metricsPage.id)
      .eq('type', 'impact_at_glance')
      .maybeSingle();

    if (
      metricsImpact?.content &&
      typeof metricsImpact.content === 'object' &&
      !Array.isArray(metricsImpact.content)
    ) {
      content = metricsImpact.content as Record<string, unknown>;
    }
  }

  // Place after programs / about when possible — near mid-page
  const { data: maxOrderRow } = await supabase
    .from('sections')
    .select('order')
    .eq('page_id', pageId)
    .order('order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = typeof maxOrderRow?.order === 'number' ? maxOrderRow.order + 10 : 60;

  // Prefer inserting after program_cards if present
  const { data: programRow } = await supabase
    .from('sections')
    .select('order')
    .eq('page_id', pageId)
    .eq('type', 'program_cards')
    .maybeSingle();

  const order =
    typeof programRow?.order === 'number' ? programRow.order + 5 : nextOrder;

  await supabase.from('sections').insert({
    page_id: pageId,
    name: 'Impact at a Glance',
    type: 'impact_at_glance',
    section_key: 'impact_at_glance',
    content,
    order,
    visible: true,
  });

  revalidatePath('/');
}
