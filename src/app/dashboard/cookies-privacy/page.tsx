import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Topbar } from '@/components/layout/Topbar';
import { parseCookieSettings } from '@/lib/cookie-consent';
import { CookieSettingsForm } from './CookieSettingsForm';

export default async function CookiesPrivacyPage() {
  const supabase = await createClient();

  const { data: settingsRow } = await (supabase as any)
    .from('cookie_consent_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  const settings = settingsRow ? parseCookieSettings(settingsRow) : null;

  return (
    <div className="w-full max-w-full">
      <Topbar title="Cookies & Privacy" subtitle="Manage the cookie consent banner and privacy settings" />

      <section className="mt-6 max-w-[740px]">
        <CookieSettingsForm initial={settings} />
      </section>
    </div>
  );
}
