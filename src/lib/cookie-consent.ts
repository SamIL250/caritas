export type CookieCategory = {
  id: string;
  name: string;
  description: string;
};

export type CookieConsentSettings = {
  id: string;
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
  necessary_cookies: CookieCategory[];
  analytics_cookies: CookieCategory[];
  marketing_cookies: CookieCategory[];
};

export const COOKIE_CONSENT_COOKIE_NAME = 'caritas_cookie_consent';

export type ConsentChoice = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

export function parseCookieSettings(row: any): CookieConsentSettings {
  return {
    id: row.id,
    enabled: row.enabled ?? true,
    show_overlay: row.show_overlay ?? true,
    banner_title: row.banner_title ?? 'We Value Your Privacy',
    banner_description: row.banner_description ?? 'We use cookies to enhance your browsing experience.',
    accept_label: row.accept_label ?? 'Accept All',
    deny_label: row.deny_label ?? 'Deny All',
    customize_label: row.customize_label ?? 'Customize',
    privacy_page_url: row.privacy_page_url ?? '/privacy-policy',
    cookie_policy_page_url: row.cookie_policy_page_url ?? '/cookie-policy',
    position: row.position ?? 'bottom',
    theme: row.theme ?? 'dark',
    consent_expiry_days: row.consent_expiry_days ?? 365,
    necessary_cookies: Array.isArray(row.necessary_cookies) ? row.necessary_cookies : [],
    analytics_cookies: Array.isArray(row.analytics_cookies) ? row.analytics_cookies : [],
    marketing_cookies: Array.isArray(row.marketing_cookies) ? row.marketing_cookies : [],
  };
}

export type PolicyPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
};

export function parsePolicyPage(row: any): PolicyPage {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content || '',
    updated_at: row.updated_at,
  };
}
