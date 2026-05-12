/** Build `fa-solid …` class from CMS values like `fa-clock-rotate-left`, `bullseye`, or `fa-solid fa-star`. */
export function faSolidIconClass(icon?: string | null): string | undefined {
  const raw = icon?.trim();
  if (!raw) return undefined;
  if (raw.startsWith("fa-brands")) return raw;
  const stripped = raw.replace(/^fa-solid\s+/i, "").trim();
  if (!stripped) return undefined;
  if (stripped.includes(" ")) return `fa-solid ${stripped}`;
  return stripped.startsWith("fa-") ? `fa-solid ${stripped}` : `fa-solid fa-${stripped}`;
}
