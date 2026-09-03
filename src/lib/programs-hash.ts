/** Read a programs department slug from a hash, including stacked `#a#b` values. */
export function parseProgramsHashSlug(hash: string): string {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const parts = raw
    .split("#")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/** Replace the programs page hash without appending onto an existing fragment. */
export function replaceProgramsHash(slug: string): void {
  const next = parseProgramsHashSlug(slug);
  if (!next || typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.hash = next;
  window.history.replaceState(null, "", `${url.pathname}${url.search}#${next}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
