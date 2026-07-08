import { GOOGLE_TRANSLATE_LANGUAGE_CODES } from "@/lib/google-translate-language-codes";
import { ISO_639_1_ALPHA2 } from "@/lib/iso-639-1-alpha2";
import {
  googTransCookieDomains,
  googTransCookiePaths,
} from "@/lib/googtrans-cookie-utils";

/** Site source language for Google Translate (static UI + CMS copy). */
export const PAGE_LANGUAGE = "en" as const;

export function canonicalTranslateLangCode(code: string): string {
  const t = code.trim();
  if (!t) return t;
  const lower = t.toLowerCase();
  if (lower === "iw") return "he";
  if (lower === "jw") return "jv";
  return t;
}

export function languageLabelEn(code: string): string {
  const c = canonicalTranslateLangCode(code.trim()) || code.trim();
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "language" });
    return dn.of(c.replace(/_/g, "-")) ?? c;
  } catch {
    return c;
  }
}

/** Widget codes ∪ ISO 639-1 alpha-2 — powers search & “type a code” flows. */
export function getAllTranslateSearchCodes(): readonly string[] {
  return [...new Set([...GOOGLE_TRANSLATE_LANGUAGE_CODES, ...ISO_639_1_ALPHA2])].filter(
    (c) => c.toLowerCase() !== PAGE_LANGUAGE,
  );
}

let cachedSearchNorm: Set<string> | null = null;
function searchCodeNormSet(): Set<string> {
  if (!cachedSearchNorm) {
    cachedSearchNorm = new Set(
      getAllTranslateSearchCodes().map((c) => c.toLowerCase().replace(/_/g, "-")),
    );
  }
  return cachedSearchNorm;
}

export function isKnownSearchLangCode(code: string): boolean {
  return searchCodeNormSet().has(code.trim().toLowerCase().replace(/_/g, "-"));
}

export type TranslateLangRow = { code: string; label: string };

let cachedRows: TranslateLangRow[] | null = null;

/** Sorted rows for the language picker (English excluded — handled separately). */
export function getAllTranslateSearchRows(): TranslateLangRow[] {
  if (cachedRows) return cachedRows;
  cachedRows = getAllTranslateSearchCodes()
    .map((code) => ({ code, label: languageLabelEn(code) }))
    .sort((a, b) => a.label.localeCompare(b.label));
  return cachedRows;
}

function parseGoogTransCookie(
  cookie: string,
  preferredTarget?: string | null,
): string | null {
  const matches = [...cookie.matchAll(/(?:^|;\s*)googtrans=([^;]+)/g)];
  if (matches.length === 0) return null;

  const values = matches.map((m) => decodeURIComponent(m[1].trim()));
  if (values.length === 1) return values[0];

  if (preferredTarget) {
    const wantEnglish = preferredTarget.toLowerCase() === PAGE_LANGUAGE;
    for (const value of values) {
      const parts = value.split("/").filter(Boolean);
      const target = parts[parts.length - 1]?.toLowerCase() ?? "";
      if (wantEnglish && (!target || target === PAGE_LANGUAGE)) return value;
      if (!wantEnglish && target === preferredTarget.toLowerCase()) return value;
    }
  }

  return values[values.length - 1];
}

/** Fired after locale is applied without a full reload (reserved for future use). */
export const TRANSLATE_LOCALE_EVENT = "caritas-translate-locale";

const TRANSLATE_RELOAD_KEY = "caritas-translate-next";

function clearGoogTransCookiesClient(): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const expire = "Thu, 01 Jan 1970 00:00:00 GMT";
  const secure = window.location.protocol === "https:" ? ";Secure" : "";
  const hostname = window.location.hostname;
  const pathname = window.location.pathname || "/";

  for (const domain of googTransCookieDomains(hostname)) {
    for (const path of googTransCookiePaths(pathname)) {
      const domainPart = domain ? `;domain=${domain}` : "";
      document.cookie = `googtrans=;expires=${expire};path=${path}${domainPart};SameSite=Lax${secure}`;
      document.cookie = `googtrans=;Max-Age=0;path=${path}${domainPart};SameSite=Lax${secure}`;
      document.cookie = `googtrans=;expires=${expire};path=${path}${domainPart};SameSite=None${secure}`;
      document.cookie = `googtrans=;Max-Age=0;path=${path}${domainPart};SameSite=None${secure}`;
    }
  }
}

function writeGoogTransCookieClient(targetLang: string): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const value = `/${PAGE_LANGUAGE}/${targetLang}`;
  const secure = window.location.protocol === "https:" ? ";Secure" : "";
  const hostname = window.location.hostname;
  const pathname = window.location.pathname || "/";

  for (const path of googTransCookiePaths(pathname)) {
    document.cookie = `googtrans=${value};path=${path};SameSite=Lax;Max-Age=31536000${secure}`;
  }
  for (const domain of googTransCookieDomains(hostname)) {
    if (!domain) continue;
    document.cookie = `googtrans=${value};path=/;domain=${domain};SameSite=Lax;Max-Age=31536000${secure}`;
  }
}

function stripTranslateDocumentMarkup(): void {
  document.documentElement.classList.remove("translated-ltr", "translated-rtl");
  document.documentElement.lang = PAGE_LANGUAGE;
}

function hardReloadPreservingPath(): void {
  window.location.replace(`${window.location.pathname}${window.location.search}`);
}

function applyTranslateLocaleClientFallback(langCode: string): void {
  const normalized = langCode.trim() ? canonicalTranslateLangCode(langCode.trim()) : "";
  const isEnglish = !normalized || normalized.toLowerCase() === PAGE_LANGUAGE;

  clearGoogTransCookiesClient();
  if (isEnglish) {
    stripTranslateDocumentMarkup();
  } else {
    writeGoogTransCookieClient(normalized);
  }
  hardReloadPreservingPath();
}

/**
 * Active translation target from `googtrans` (`/en/fr`, `/auto/zh-CN`, …).
 * Returns `en` when absent or already English.
 */
export function getActiveTranslateTargetFromCookie(
  cookieHeader: string | undefined,
  preferredTarget?: string | null,
): string {
  if (!cookieHeader) return PAGE_LANGUAGE;
  const raw = parseGoogTransCookie(cookieHeader, preferredTarget);
  if (!raw) return PAGE_LANGUAGE;
  const parts = raw.split("/").filter(Boolean);
  const target = parts[parts.length - 1];
  if (!target) return PAGE_LANGUAGE;
  const canon = canonicalTranslateLangCode(target);
  if (canon.toLowerCase() === PAGE_LANGUAGE) return PAGE_LANGUAGE;
  return target;
}

export function getActiveTranslateLocaleClient(): string {
  if (typeof document === "undefined") return PAGE_LANGUAGE;
  let pending: string | null = null;
  try {
    pending = sessionStorage.getItem(TRANSLATE_RELOAD_KEY);
  } catch {
    /* ignore */
  }
  const target = getActiveTranslateTargetFromCookie(document.cookie, pending);
  const resolved = canonicalTranslateLangCode(target);

  if (pending && codesMatchLocale(resolved, pending)) {
    try {
      sessionStorage.removeItem(TRANSLATE_RELOAD_KEY);
    } catch {
      /* ignore */
    }
  }

  return resolved;
}

function codesMatchLocale(a: string, b: string): boolean {
  return canonicalTranslateLangCode(a).toLowerCase() === canonicalTranslateLangCode(b).toLowerCase();
}


/** Set Google Translate cookie via API (reliable on /dashboard) and reload. */
export function applyTranslateLocale(langCode: string): void {
  if (typeof window === "undefined") return;
  const raw = langCode.trim();
  const normalized = raw ? canonicalTranslateLangCode(raw) : "";
  const nextLang = !normalized || normalized.toLowerCase() === PAGE_LANGUAGE ? PAGE_LANGUAGE : normalized;

  try {
    sessionStorage.setItem(TRANSLATE_RELOAD_KEY, nextLang);
  } catch {
    /* ignore */
  }

  clearGoogTransCookiesClient();
  stripTranslateDocumentMarkup();

  void fetch("/api/translate-locale", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    keepalive: true,
    body: JSON.stringify({ lang: nextLang }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("translate-locale failed");
      hardReloadPreservingPath();
    })
    .catch(() => {
      applyTranslateLocaleClientFallback(nextLang);
    });
}

/** Read pending locale written before reload (does not remove it). */
export function consumePendingTranslateLocale(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return sessionStorage.getItem(TRANSLATE_RELOAD_KEY);
  } catch {
    return null;
  }
}

/** Legacy: widget-only targets (emails, constraints). Prefer {@link getAllTranslateSearchCodes} for UI. */
export const TRANSLATE_TARGET_CODES: readonly string[] = GOOGLE_TRANSLATE_LANGUAGE_CODES.filter(
  (c) => c.toLowerCase() !== PAGE_LANGUAGE,
);

/** If the query looks like a BCP‑47-style tag, normalize it for `googtrans`. */
export function normalizeTypedLangCode(raw: string): string {
  const s = raw.trim().replace(/_/g, "-");
  const parts = s.split("-").filter(Boolean);
  if (parts.length === 0) return s;
  const head = parts[0].toLowerCase();
  if (parts.length === 1) return head;
  const tail = parts
    .slice(1)
    .map((p) => (p.length <= 4 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()))
    .join("-");
  return `${head}-${tail}`;
}

export function looksLikeLangTag(query: string): boolean {
  const t = query.trim();
  return /^[a-z]{2,3}(-[a-z0-9]{2,10})?$/i.test(t);
}
