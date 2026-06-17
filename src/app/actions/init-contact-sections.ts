'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

const DEFAULT_CONTACT_CONTENT = {
  eyebrow: "Get In Touch",
  heading_line1: "Let's Talk &",
  heading_line2: "Work Together",
  subtext:
    "Please reach out to us with any questions, partnership opportunities, or to learn more about our initiatives across Rwanda.",
  headquarters_label: "Headquarters",
  headquarters: "Kigali, Kucukiro, Kagarama",
  phone_label: "Phone",
  phone: "(+250) 252 574 34",
  email_label: "Email",
  email: "info@caritasrwanda.org",
  hours_label: "Office Hours",
  office_hours: "Mon – Fri, 8:00 AM – 5:00 PM",
  form_title: "Send Us a Message",
  form_subtitle: "We'll get back to you within 24 hours.",
};

const DEFAULT_MAP_CONTENT = {
  eyebrow: "Find Us",
  heading: "Our Location on",
  heading_accent: "The Map",
  subtext: "Visit us at the Caritas Rwanda offices in Kigali — we'd love to welcome you.",
  map_a_title: "Street View",
  map_a_subtitle: "Explore our surroundings in 360°",
  map_a_embed_url:
    "https://www.google.com/maps/embed?pb=!4v1776831990082!6m8!1m7!1shQopyAPx9qTD4VQMaDmVfg!2m2!1d-1.948423749421037!2d30.05942523532954!3f245.44809355904687!4f1.5795459231316045!5f0.7820865974627469",
  map_b_title: "Caritas Rwanda HQ",
  map_b_subtitle: "Kigali, Rwanda — get directions",
  map_b_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5112492331314!2d30.05660827473925!3d-1.9485541980337648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425b5be2a55%3A0xcc6cf890e6ae864!2sCaritas%20Rwanda!5e0!3m2!1sen!2srw!4v1776832048548!5m2!1sen!2srw",
};

/**
 * Ensures that the contact page has both a `contact_info` and `map_section`
 * row in the `sections` table. If they don't exist, they are inserted with
 * sensible defaults so the dashboard can edit them immediately.
 *
 * This is safe to call on every render — it only inserts when rows are missing.
 */
export async function ensureContactPageSections(pageId: string) {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('sections')
    .select('id, type')
    .eq('page_id', pageId)
    .in('type', ['contact_info', 'map_section']);

  const hasContactInfo = existing?.some((s) => s.type === 'contact_info');
  const hasMapSection = existing?.some((s) => s.type === 'map_section');

  const toInsert: Array<{
    page_id: string;
    type: string;
    content: object;
    order: number;
    visible: boolean;
  }> = [];

  if (!hasContactInfo) {
    toInsert.push({
      page_id: pageId,
      type: 'contact_info',
      content: DEFAULT_CONTACT_CONTENT,
      order: 10,
      visible: true,
    });
  }

  if (!hasMapSection) {
    toInsert.push({
      page_id: pageId,
      type: 'map_section',
      content: DEFAULT_MAP_CONTENT,
      order: 20,
      visible: true,
    });
  }

  if (toInsert.length > 0) {
    await supabase.from('sections').insert(toInsert);
    revalidatePath('/contact');
  }
}
