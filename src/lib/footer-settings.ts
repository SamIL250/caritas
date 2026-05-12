/**
 * Footer copy and links live in site_settings.options.footer (jsonb).
 * Merged with FOOTER_DEFAULTS when keys are missing (public site + editor).
 */

export type FooterNavLink = {
  label: string;
  href: string;
  /** "donate" opens the donation modal instead of navigating */
  behavior?: "nav" | "donate";
};

export type FooterProgramLink = { label: string; href: string };

export type FooterLegalLink = { label: string; href: string };

export type FooterSettings = {
  banner: {
    lineBefore: string;
    accent: string;
    lineAfter: string;
    ctaLabel: string;
    ctaHref: string;
  };
  brand: {
    mission: string;
    /** Optional override; empty uses /img/logo_caritas.png */
    logoUrl: string | null;
  };
  social: {
    twitter: string;
    youtube: string;
    facebook: string;
    linkedin: string;
    flickr: string;
  };
  quickLinks: FooterNavLink[];
  programColumn: {
    heading: string;
    links: FooterProgramLink[];
  };
  newsletter: {
    heading: string;
    description: string;
    placeholder: string;
    buttonLabel: string;
  };
  contact: {
    addressLabel: string;
    address: string;
    phoneLabel: string;
    phone: string;
    emailLabel: string;
    email: string;
  };
  bottom: {
    orgName: string;
    showDeveloperCredit: boolean;
    developerCredit: string;
  };
  legalLinks: FooterLegalLink[];
};

export const FOOTER_DEFAULTS: FooterSettings = {
  banner: {
    lineBefore: "Serving Rwanda with ",
    accent: "Faith, Hope",
    lineAfter: " & Love.",
    ctaLabel: "Get In Touch",
    ctaHref: "#contact",
  },
  brand: {
    mission:
      "Committed to the promotion of human dignity and integral development, inspired by the Gospel and Catholic social teaching.",
    logoUrl: null,
  },
  social: {
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
    flickr: "https://flickr.com",
  },
  quickLinks: [
    { label: "Home", href: "/", behavior: "nav" },
    { label: "About Us", href: "#about", behavior: "nav" },
    { label: "Our Programs", href: "#programs", behavior: "nav" },
    { label: "News", href: "#stories", behavior: "nav" },
    { label: "Support our Mission", href: "#", behavior: "donate" },
    { label: "Annual Reports", href: "/reports", behavior: "nav" },
    { label: "Careers", href: "/careers", behavior: "nav" },
  ],
  programColumn: {
    heading: "Our Programs",
    links: [
      { label: "Administration & Finance", href: "#programs" },
      { label: "Social Welfare", href: "#programs" },
      { label: "Health", href: "#programs" },
      { label: "Development", href: "#programs" },
    ],
  },
  newsletter: {
    heading: "Stay Updated",
    description:
      "Subscribe to our newsletter and get the latest stories, program updates, and impact reports delivered to your inbox.",
    placeholder: "your@email.com",
    buttonLabel: "Subscribe",
  },
  contact: {
    addressLabel: "Headquarters",
    address: "Kigali, Rwanda",
    phoneLabel: "Phone",
    phone: "(+250) 252 574 34",
    emailLabel: "Email",
    email: "info@caritasrwanda.org",
  },
  bottom: {
    orgName: "Caritas Rwanda",
    showDeveloperCredit: true,
    developerCredit: "Lerony Software Company",
  },
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

function isObj(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

function mergeBanner(
  base: FooterSettings["banner"],
  patch: unknown
): FooterSettings["banner"] {
  if (!isObj(patch)) return { ...base };
  return {
    lineBefore: typeof patch.lineBefore === "string" ? patch.lineBefore : base.lineBefore,
    accent: typeof patch.accent === "string" ? patch.accent : base.accent,
    lineAfter: typeof patch.lineAfter === "string" ? patch.lineAfter : base.lineAfter,
    ctaLabel: typeof patch.ctaLabel === "string" ? patch.ctaLabel : base.ctaLabel,
    ctaHref: typeof patch.ctaHref === "string" ? patch.ctaHref : base.ctaHref,
  };
}

function mergeBrand(
  base: FooterSettings["brand"],
  patch: unknown
): FooterSettings["brand"] {
  if (!isObj(patch)) return { ...base };
  return {
    mission: typeof patch.mission === "string" ? patch.mission : base.mission,
    logoUrl:
      patch.logoUrl === null
        ? null
        : typeof patch.logoUrl === "string"
          ? patch.logoUrl
          : base.logoUrl,
  };
}

function mergeSocial(
  base: FooterSettings["social"],
  patch: unknown
): FooterSettings["social"] {
  if (!isObj(patch)) return { ...base };
  const k = <K extends keyof FooterSettings["social"]>(key: K) =>
    typeof patch[key] === "string" ? (patch[key] as string) : base[key];
  return {
    twitter: k("twitter"),
    youtube: k("youtube"),
    facebook: k("facebook"),
    linkedin: k("linkedin"),
    flickr: k("flickr"),
  };
}

function mergeNavLinks(patch: unknown, fallback: FooterNavLink[]): FooterNavLink[] {
  if (!Array.isArray(patch)) return [...fallback];
  const out: FooterNavLink[] = [];
  for (const item of patch) {
    if (!isObj(item)) continue;
    const label = typeof item.label === "string" ? item.label : "";
    const href = typeof item.href === "string" ? item.href : "#";
    const behavior =
      item.behavior === "donate" ? "donate" : item.behavior === "nav" ? "nav" : undefined;
    if (!label) continue;
    out.push({ label, href, behavior: behavior ?? "nav" });
  }
  return out.length ? out : [...fallback];
}

function mergeProgramLinks(patch: unknown, fallback: FooterProgramLink[]): FooterProgramLink[] {
  if (!Array.isArray(patch)) return [...fallback];
  const out: FooterProgramLink[] = [];
  for (const item of patch) {
    if (!isObj(item)) continue;
    const label = typeof item.label === "string" ? item.label : "";
    const href = typeof item.href === "string" ? item.href : "#";
    if (!label) continue;
    out.push({ label, href });
  }
  return out.length ? out : [...fallback];
}

function mergeNewsletter(
  base: FooterSettings["newsletter"],
  patch: unknown
): FooterSettings["newsletter"] {
  if (!isObj(patch)) return { ...base };
  return {
    heading: typeof patch.heading === "string" ? patch.heading : base.heading,
    description: typeof patch.description === "string" ? patch.description : base.description,
    placeholder:
      typeof patch.placeholder === "string" ? patch.placeholder : base.placeholder,
    buttonLabel:
      typeof patch.buttonLabel === "string" ? patch.buttonLabel : base.buttonLabel,
  };
}

function mergeContact(
  base: FooterSettings["contact"],
  patch: unknown
): FooterSettings["contact"] {
  if (!isObj(patch)) return { ...base };
  const s = (k: keyof FooterSettings["contact"]) =>
    typeof patch[k] === "string" ? (patch[k] as string) : base[k];
  return {
    addressLabel: s("addressLabel"),
    address: s("address"),
    phoneLabel: s("phoneLabel"),
    phone: s("phone"),
    emailLabel: s("emailLabel"),
    email: s("email"),
  };
}

function mergeBottom(
  base: FooterSettings["bottom"],
  patch: unknown
): FooterSettings["bottom"] {
  if (!isObj(patch)) return { ...base };
  return {
    orgName: typeof patch.orgName === "string" ? patch.orgName : base.orgName,
    showDeveloperCredit:
      typeof patch.showDeveloperCredit === "boolean"
        ? patch.showDeveloperCredit
        : base.showDeveloperCredit,
    developerCredit:
      typeof patch.developerCredit === "string"
        ? patch.developerCredit
        : base.developerCredit,
  };
}

function mergeLegal(patch: unknown, fallback: FooterLegalLink[]): FooterLegalLink[] {
  if (!Array.isArray(patch)) return [...fallback];
  const out: FooterLegalLink[] = [];
  for (const item of patch) {
    if (!isObj(item)) continue;
    const label = typeof item.label === "string" ? item.label : "";
    const href = typeof item.href === "string" ? item.href : "#";
    if (!label) continue;
    out.push({ label, href });
  }
  return out.length ? out : [...fallback];
}

/** Merge stored json (or unknown) onto defaults. */
export function mergeFooterSettings(stored: unknown): FooterSettings {
  const d = FOOTER_DEFAULTS;
  if (!isObj(stored)) return { ...d, brand: { ...d.brand }, social: { ...d.social } };
  return {
    banner: mergeBanner(d.banner, stored.banner),
    brand: mergeBrand(d.brand, stored.brand),
    social: mergeSocial(d.social, stored.social),
    quickLinks: mergeNavLinks(stored.quickLinks, d.quickLinks),
    programColumn: isObj(stored.programColumn)
      ? {
          heading:
            typeof stored.programColumn.heading === "string"
              ? stored.programColumn.heading
              : d.programColumn.heading,
          links: mergeProgramLinks(stored.programColumn.links, d.programColumn.links),
        }
      : { ...d.programColumn, links: [...d.programColumn.links] },
    newsletter: mergeNewsletter(d.newsletter, stored.newsletter),
    contact: mergeContact(d.contact, stored.contact),
    bottom: mergeBottom(d.bottom, stored.bottom),
    legalLinks: mergeLegal(stored.legalLinks, d.legalLinks),
  };
}

export function parseFooterFromOptions(options: unknown): FooterSettings {
  if (!isObj(options) || !("footer" in options)) return mergeFooterSettings(undefined);
  return mergeFooterSettings(options.footer);
}
