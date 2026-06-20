'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CookieConsentSettings } from '@/lib/cookie-consent';
import type { Json } from '@/types/database.types';

export type CookieConsentUpdate = {
  enabled: boolean;
  show_overlay: boolean;
  banner_title: string;
  banner_description: string;
  accept_label: string;
  deny_label: string;
  customize_label: string;
  privacy_page_url: string;
  cookie_policy_page_url: string;
  position: string;
  theme: string;
  consent_expiry_days: number;
  necessary_cookies: { id: string; name: string; description: string }[];
  analytics_cookies: { id: string; name: string; description: string }[];
  marketing_cookies: { id: string; name: string; description: string }[];
};

export async function updateCookieConsentSettings(payload: CookieConsentUpdate) {
  const supabase = await createClient();

  const { data: existing } = await (supabase as any)
    .from('cookie_consent_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (!existing) {
    const { error } = await (supabase as any).from('cookie_consent_settings').insert({
      ...payload,
      necessary_cookies: payload.necessary_cookies as unknown as Json,
      analytics_cookies: payload.analytics_cookies as unknown as Json,
      marketing_cookies: payload.marketing_cookies as unknown as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) return { error: error.message, success: false as const };
  } else {
    const { error } = await (supabase as any)
      .from('cookie_consent_settings')
      .update({
        ...payload,
        necessary_cookies: payload.necessary_cookies as unknown as Json,
        analytics_cookies: payload.analytics_cookies as unknown as Json,
        marketing_cookies: payload.marketing_cookies as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) return { error: error.message, success: false as const };
  }

  revalidatePath('/');
  revalidatePath('/dashboard/cookies-privacy');
  return { success: true as const };
}
