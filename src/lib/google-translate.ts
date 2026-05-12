import { GOOGLE_TRANSLATE_LANGUAGE_CODES } from "@/lib/google-translate-language-codes";
import { ISO_639_1_ALPHA2 } from "@/lib/iso-639-1-alpha2";

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

function parseGoogTransCookie(cookie: string): string | null {
  const m = cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (!m) return null;
  return decodeURIComponent(m[1].trim());
}

/**
 * Active translation target from `googtrans` (`/en/fr`, `/auto/zh-CN`, …).
 * Returns `en` when absent or already English.
 */
export function getActiveTranslateTargetFromCookie(cookieHeader: string | undefined): string {
  if (!cookieHeader) return PAGE_LANGUAGE;
  const raw = parseGoogTransCookie(cookieHeader);
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
  const target = getActiveTranslateTargetFromCookie(document.cookie);
  return canonicalTranslateLangCode(target);
}

function clearGoogTransCookies(): void {
  const expire = "Thu, 01 Jan 1970 00:00:00 GMT";
  const pairs: string[] = [`googtrans=;expires=${expire};path=/`];
  try {
    const host = window.location.hostname;
    if (host && host !== "localhost") {
      pairs.push(`googtrans=;expires=${expire};path=/;domain=${host}`);
      pairs.push(`googtrans=;expires=${expire};path=/;domain=.${host}`);
    }
  } catch {
    /* ignore */
  }
  for (const p of pairs) {
    document.cookie = p;
  }
}

/** Set Google Translate cookie and reload so the widget applies page-wide translation. */
export function applyTranslateLocale(langCode: string): void {
  if (typeof window === "undefined") return;
  const raw = langCode.trim();
  if (!raw || raw.toLowerCase() === PAGE_LANGUAGE) {
    clearGoogTransCookies();
    window.location.reload();
    return;
  }
  document.cookie = `googtrans=/${PAGE_LANGUAGE}/${raw};path=/`;
  window.location.reload();
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
