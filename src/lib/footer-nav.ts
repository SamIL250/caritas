/** True for URLs that should use a plain anchor (not Next Link prefetch). */
export function isExternalOrSpecialHref(href: string) {
  return /^(https?:|\/\/|mailto:|tel:)/i.test(href);
}
