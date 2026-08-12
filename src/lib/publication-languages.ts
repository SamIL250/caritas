/** Default languages offered when uploading a publication. */
export const DEFAULT_PUBLICATION_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "rw", label: "Kinyarwanda" },
  { code: "es", label: "Spanish" },
] as const;

export type PublicationLanguageOption = { code: string; label: string };

const DEFAULT_CODES: Set<string> = new Set(
  DEFAULT_PUBLICATION_LANGUAGES.map((l) => l.code),
);

/** Normalize to a short lowercase code (letters/digits/hyphen). */
export function normalizePublicationLanguageCode(raw: string): string {
  const s = (raw || "").trim().toLowerCase();
  if (!s) return "en";
  const cleaned = s
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned.slice(0, 32) || "en";
}

export function publicationLanguageLabel(code: string, customLabel?: string | null): string {
  const c = normalizePublicationLanguageCode(code);
  if (customLabel && customLabel.trim()) return customLabel.trim();
  const known = DEFAULT_PUBLICATION_LANGUAGES.find((l) => l.code === c);
  if (known) return known.label;
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "language" });
    const label = dn.of(c);
    if (label && label !== c) return label;
  } catch {
    /* ignore */
  }
  return c.toUpperCase();
}

/** Merge defaults with any extra codes found in published content. */
export function mergePublicationLanguageOptions(
  extraCodes: string[],
): PublicationLanguageOption[] {
  const map = new Map<string, PublicationLanguageOption>();
  for (const d of DEFAULT_PUBLICATION_LANGUAGES) {
    map.set(d.code, { code: d.code, label: d.label });
  }
  for (const raw of extraCodes) {
    const code = normalizePublicationLanguageCode(raw);
    if (!code || map.has(code)) continue;
    map.set(code, { code, label: publicationLanguageLabel(code) });
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function isDefaultPublicationLanguage(code: string): boolean {
  return DEFAULT_CODES.has(normalizePublicationLanguageCode(code));
}
