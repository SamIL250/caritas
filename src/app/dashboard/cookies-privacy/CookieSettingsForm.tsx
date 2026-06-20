'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { updateCookieConsentSettings } from '@/app/actions/cookie-consent';
import type { CookieConsentSettings } from '@/lib/cookie-consent';

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1">{children}</p>;
}

function Input({ value, onChange, placeholder, className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] ${className}`}
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-stone-200 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

type CategoryItem = { id: string; name: string; description: string };

function CategoryEditor({ label, items, onChange }: {
  label: string; items: CategoryItem[]; onChange: (items: CategoryItem[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <button
          type="button"
          className="text-[9px] font-bold text-stone-400 hover:text-[#7A1515]"
          onClick={() => onChange([...items, { id: '', name: '', description: '' }])}
        >
          + Add
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-stone-100 bg-stone-50">
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex gap-2">
              <input
                className="w-24 rounded border border-stone-200 p-1.5 text-[11px]"
                placeholder="ID (e.g. ga)"
                value={item.id}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], id: e.target.value };
                  onChange(next);
                }}
              />
              <input
                className="flex-1 rounded border border-stone-200 p-1.5 text-[11px]"
                placeholder="Name"
                value={item.name}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], name: e.target.value };
                  onChange(next);
                }}
              />
            </div>
            <input
              className="w-full rounded border border-stone-200 p-1.5 text-[11px]"
              placeholder="Description"
              value={item.description}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], description: e.target.value };
                onChange(next);
              }}
            />
          </div>
          <button
            type="button"
            className="text-red-400 hover:text-red-600 mt-1"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function CookieSettingsForm({ initial }: { initial: CookieConsentSettings | null }) {
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [showOverlay, setShowOverlay] = useState(initial?.show_overlay ?? true);
  const [bannerTitle, setBannerTitle] = useState(initial?.banner_title ?? 'We Value Your Privacy');
  const [bannerDesc, setBannerDesc] = useState(initial?.banner_description ?? '');
  const [acceptLabel, setAcceptLabel] = useState(initial?.accept_label ?? 'Accept All');
  const [denyLabel, setDenyLabel] = useState(initial?.deny_label ?? 'Deny All');
  const [customizeLabel, setCustomizeLabel] = useState(initial?.customize_label ?? 'Customize');
  const [privacyUrl, setPrivacyUrl] = useState(initial?.privacy_page_url ?? '/privacy-policy');
  const [cookiePolicyUrl, setCookiePolicyUrl] = useState(initial?.cookie_policy_page_url ?? '/cookie-policy');
  const [position, setPosition] = useState(initial?.position ?? 'bottom');
  const [theme, setTheme] = useState(initial?.theme ?? 'dark');
  const [expiryDays, setExpiryDays] = useState(initial?.consent_expiry_days ?? 365);
  const [necessaryCookies, setNecessaryCookies] = useState<CategoryItem[]>(initial?.necessary_cookies ?? []);
  const [analyticsCookies, setAnalyticsCookies] = useState<CategoryItem[]>(initial?.analytics_cookies ?? []);
  const [marketingCookies, setMarketingCookies] = useState<CategoryItem[]>(initial?.marketing_cookies ?? []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateCookieConsentSettings({
      enabled,
      show_overlay: showOverlay,
      banner_title: bannerTitle,
      banner_description: bannerDesc,
      accept_label: acceptLabel,
      deny_label: denyLabel,
      customize_label: customizeLabel,
      privacy_page_url: privacyUrl,
      cookie_policy_page_url: cookiePolicyUrl,
      position,
      theme,
      consent_expiry_days: expiryDays,
      necessary_cookies: necessaryCookies,
      analytics_cookies: analyticsCookies,
      marketing_cookies: marketingCookies,
    });
    if (result.success) {
      setMessage({ type: 'ok', text: 'Settings saved successfully.' });
    } else {
      setMessage({ type: 'err', text: result.error || 'Failed to save settings.' });
    }
    setSaving(false);
  }, [enabled, showOverlay, bannerTitle, bannerDesc, acceptLabel, denyLabel, customizeLabel, privacyUrl, cookiePolicyUrl, position, theme, expiryDays, necessaryCookies, analyticsCookies, marketingCookies]);

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-800">Cookie Consent Banner</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure the cookie consent banner shown to visitors on the public website.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Dim Background</span>
            <input
              type="checkbox"
              checked={showOverlay}
              onChange={(e) => setShowOverlay(e.target.checked)}
              className="rounded text-[#7A1515] focus:ring-[#7A1515]/30"
            />
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Enabled</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded text-[#7A1515] focus:ring-[#7A1515]/30"
            />
          </label>
        </div>
      </div>

      <div className="flex gap-3 text-xs">
        <a href="/dashboard/policy-pages" className="text-[#7A1515] font-bold hover:underline">Edit Privacy Policy →</a>
        <a href="/dashboard/policy-pages" className="text-[#7A1515] font-bold hover:underline">Edit Cookie Policy →</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Banner Title</Label>
          <Input value={bannerTitle} onChange={setBannerTitle} placeholder="We Value Your Privacy" />
        </div>
        <div className="space-y-1.5">
          <Label>Consent Expiry (days)</Label>
          <input
            type="number"
            value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Banner Description</Label>
        <textarea
          value={bannerDesc}
          onChange={(e) => setBannerDesc(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Accept Button</Label>
          <Input value={acceptLabel} onChange={setAcceptLabel} placeholder="Accept All" />
        </div>
        <div className="space-y-1.5">
          <Label>Deny Button</Label>
          <Input value={denyLabel} onChange={setDenyLabel} placeholder="Deny All" />
        </div>
        <div className="space-y-1.5">
          <Label>Customize Button</Label>
          <Input value={customizeLabel} onChange={setCustomizeLabel} placeholder="Customize" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Privacy Policy URL</Label>
          <Input value={privacyUrl} onChange={setPrivacyUrl} placeholder="/privacy-policy" />
        </div>
        <div className="space-y-1.5">
          <Label>Cookie Policy URL</Label>
          <Input value={cookiePolicyUrl} onChange={setCookiePolicyUrl} placeholder="/cookie-policy" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Banner Position</Label>
          <Select
            value={position}
            onChange={setPosition}
            options={[
              { value: 'bottom', label: 'Bottom Center' },
              { value: 'top', label: 'Top Center' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Theme</Label>
          <Select
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </div>
      </div>

      <hr className="border-stone-100" />

      <CategoryEditor label="Necessary Cookies (always enabled)" items={necessaryCookies} onChange={setNecessaryCookies} />
      <CategoryEditor label="Analytics Cookies" items={analyticsCookies} onChange={setAnalyticsCookies} />
      <CategoryEditor label="Marketing Cookies" items={marketingCookies} onChange={setMarketingCookies} />

      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <div>
          {message && (
            <span className={`text-xs font-bold ${message.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </Card>
  );
}
