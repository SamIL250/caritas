'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function revalidatePathsForPage(pageId: string | null | undefined) {
  revalidatePath('/');
  if (!pageId) return;
  const supabase = await createClient();
  const { data } = await supabase.from('pages').select('slug').eq('id', pageId).maybeSingle();
  const slug = data?.slug as string | undefined;
  if (!slug || slug === 'home') return;
  revalidatePath(`/${slug}`);
}

export async function saveSection(sectionId: string, type: string, content: any) {
  const supabase = await createClient();
  const { data: before } = await supabase
    .from('sections')
    .select('page_id')
    .eq('id', sectionId)
    .maybeSingle();

  const { error } = await supabase
    .from('sections')
    .update({ 
      content, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', sectionId);

  if (error) throw new Error(error.message);
  await revalidatePathsForPage(before?.page_id);
}

export async function saveHero(pageId: string, data: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('hero_content')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('page_id', pageId);

  if (error) throw new Error(error.message);
  await revalidatePathsForPage(pageId);
}

export async function deleteSection(sectionId: string) {
  const supabase = await createClient();
  const { data: before } = await supabase
    .from('sections')
    .select('page_id')
    .eq('id', sectionId)
    .maybeSingle();

  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', sectionId);

  if (error) throw new Error(error.message);
  await revalidatePathsForPage(before?.page_id);
}

export async function toggleSectionVisibility(sectionId: string, visible: boolean) {
  const supabase = await createClient();
  const { data: before } = await supabase
    .from('sections')
    .select('page_id')
    .eq('id', sectionId)
    .maybeSingle();

  const { error } = await supabase
    .from('sections')
    .update({ visible, updated_at: new Date().toISOString() })
    .eq('id', sectionId);

  if (error) throw new Error(error.message);
  await revalidatePathsForPage(before?.page_id);
}

export async function reorderSections(sectionOrders: { id: string, order: number }[]) {
  const supabase = await createClient();
  let pageId: string | undefined;
  if (sectionOrders[0]?.id) {
    const { data } = await supabase
      .from('sections')
      .select('page_id')
      .eq('id', sectionOrders[0].id)
      .maybeSingle();
    pageId = data?.page_id;
  }

  for (const item of sectionOrders) {
    await supabase
      .from('sections')
      .update({ order: item.order })
      .eq('id', item.id);
  }
  await revalidatePathsForPage(pageId);
}

export async function addSection(pageId: string, type: string, content: any, order: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sections')
    .insert({
      page_id: pageId,
      type,
      content,
      order,
      visible: true
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await revalidatePathsForPage(pageId);
  return data;
}

export async function updatePageStatus(pageId: string, status: 'draft' | 'published') {
  const supabase = await createClient();
  const { error } = await supabase
    .from('pages')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', pageId);

  if (error) throw new Error(error.message);
  await revalidatePathsForPage(pageId);
}

export async function updatePageTitle(pageId: string, title: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('pages')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', pageId);

  if (error) throw new Error(error.message);
}

// Slide Management
export async function addSlide(pageId: string, order: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('slide_items')
    .insert({
      page_id: pageId,
      image_url: '/img/bg_3.png',
      heading: 'New Slide Heading',
      subheading: 'Add slide description here.',
      order,
      visible: true
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await revalidatePathsForPage(pageId);
  return data;
}

export async function saveSlide(slideId: string, data: any) {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from('slide_items')
    .select('page_id')
    .eq('id', slideId)
    .maybeSingle();

  const { error } = await supabase
    .from('slide_items')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', slideId);

  if (error) throw new Error(error.message);
  await revalidatePathsForPage(row?.page_id);
}

export async function deleteSlide(slideId: string) {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from('slide_items')
    .select('page_id')
    .eq('id', slideId)
    .maybeSingle();

  const { error } = await supabase
    .from('slide_items')
    .delete()
    .eq('id', slideId);

  if (error) throw new Error(error.message);
  await revalidatePathsForPage(row?.page_id);
}

export async function reorderSlides(slideOrders: { id: string, order: number }[]) {
  const supabase = await createClient();
  let pageId: string | undefined;
  if (slideOrders[0]?.id) {
    const { data } = await supabase
      .from('slide_items')
      .select('page_id')
      .eq('id', slideOrders[0].id)
      .maybeSingle();
    pageId = data?.page_id;
  }

  for (const item of slideOrders) {
    await supabase
      .from('slide_items')
      .update({ order: item.order })
      .eq('id', item.id);
  }
  await revalidatePathsForPage(pageId);
}
