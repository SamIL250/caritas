export type MvvStatement = {
  variant: "vision" | "mission";
  label: string;
  body: string;
};

export type MvvValueItem = {
  icon: string;
  name: string;
  desc: string;
};

export const DEFAULT_MVV_TITLE = "Vision, Mission & Values";

export const DEFAULT_MVV_STATEMENTS: MvvStatement[] = [
  {
    variant: "vision",
    label: "Our Vision",
    body:
      "A Rwanda where every person — regardless of background, status, or circumstance — lives with full **dignity, equal rights**, and the opportunity to flourish in body, mind, and spirit through inclusive, non-discriminatory interventions.",
  },
  {
    variant: "mission",
    label: "Our Mission",
    body:
      "To assist people in need and promote their **integral human development**, drawing on Charity as per the Word of God — reaching the poor, sick, elderly, refugees, people with disabilities, and all vulnerable communities across Rwanda.",
  },
];

export const DEFAULT_MVV_VALUES_EYEBROW = "Core Values";
export const DEFAULT_MVV_VALUES_EYEBROW_ICON = "fa-star";
export const DEFAULT_MVV_VALUES_TITLE = "Principles We Live By";

export const DEFAULT_MVV_VALUE_ITEMS: MvvValueItem[] = [
  { icon: "fa-megaphone", name: "Advocacy", desc: "Speaking up for the vulnerable and voiceless" },
  { icon: "fa-heart", name: "Compassion", desc: "Meeting suffering with sincere care and empathy" },
  { icon: "fa-scale-balanced", name: "Equity", desc: "Ensuring fair access and equal opportunity for all" },
  { icon: "fa-leaf", name: "Environment Protection", desc: "Safeguarding creation for future generations" },
  { icon: "fa-sun", name: "Hope", desc: "Inspiring confidence in a brighter tomorrow" },
  { icon: "fa-person-rays", name: "Human Dignity", desc: "Honouring the sacred worth of every person" },
  { icon: "fa-gavel", name: "Justice", desc: "Upholding rights, fairness, and moral integrity" },
  { icon: "fa-hand-holding-heart", name: "Service", desc: "Giving selflessly to those who need it most" },
  { icon: "fa-handshake", name: "Solidarity", desc: "Standing united across all communities" },
  {
    icon: "fa-shield-halved",
    name: "Stewardship & Accountability",
    desc: "Managing every resource with full transparency",
  },
  {
    icon: "fa-people-group",
    name: "Subsidiarity & Partnership",
    desc: "Empowering local action through collaboration",
  },
];

export const DEFAULT_MVV_BG_SLIDES = [
  "https://caritasrwanda.org/wp-content/uploads/2025/06/162A1384-scaled.jpg",
  "https://caritasrwanda.org/wp-content/uploads/2025/03/162A9519-scaled.jpg",
  "https://caritasrwanda.org/wp-content/uploads/2025/03/162A5107-scaled.jpg",
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeStatement(raw: unknown): MvvStatement | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const variant = row.variant === "mission" ? "mission" : row.variant === "vision" ? "vision" : null;
  if (!variant) return null;
  const label = asString(row.label).trim();
  const body = asString(row.body).trim();
  if (!label || !body) return null;
  return { variant, label, body };
}

function normalizeLegacyPillar(raw: unknown): MvvStatement | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const variant = row.variant === "mission" ? "mission" : row.variant === "vision" ? "vision" : null;
  if (!variant) return null;
  const label = asString(row.label).trim();
  const body = asString(row.body).trim();
  if (!label || !body) return null;
  return { variant, label, body };
}

export function parseMissionVisionContent(content: unknown) {
  const c = asRecord(content);
  const title = asString(c.title, DEFAULT_MVV_TITLE).trim() || DEFAULT_MVV_TITLE;

  let statements: MvvStatement[] = [];
  if (Array.isArray(c.statements)) {
    statements = c.statements
      .map(normalizeStatement)
      .filter((s): s is MvvStatement => s !== null);
  }
  if (statements.length === 0 && Array.isArray(c.pillars)) {
    statements = c.pillars
      .map(normalizeLegacyPillar)
      .filter((s): s is MvvStatement => s !== null);
  }
  if (statements.length === 0) {
    statements = DEFAULT_MVV_STATEMENTS.map((s) => ({ ...s }));
  }

  return { title, statements };
}

function normalizeValueItem(raw: unknown, index: number): MvvValueItem | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const name = asString(row.name).trim();
  if (!name) return null;
  const icon = asString(row.icon, "fa-star").trim() || "fa-star";
  const desc =
    asString(row.desc).trim() ||
    DEFAULT_MVV_VALUE_ITEMS[index]?.desc ||
    DEFAULT_MVV_VALUE_ITEMS.find((v) => v.name === name)?.desc ||
    "";
  return { icon, name, desc };
}

export function hydrateMissionVisionEditorContent(content: unknown): Record<string, unknown> {
  const c = asRecord(content);
  const parsed = parseMissionVisionContent(content);
  return {
    ...c,
    title: parsed.title,
    anchor_id: asString(c.anchor_id, "mission").trim() || "mission",
    statements: parsed.statements.map((s) => ({ ...s })),
  };
}

export function hydrateValuesGridEditorContent(content: unknown): Record<string, unknown> {
  const c = asRecord(content);
  const parsed = parseValuesGridContent(content);
  return {
    ...c,
    eyebrow: parsed.valuesEyebrow,
    eyebrow_icon: parsed.valuesEyebrowIcon,
    title: parsed.valuesTitle,
    anchor_id: asString(c.anchor_id, "values").trim() || "values",
    items: parsed.values.map((v) => ({ ...v })),
  };
}

export function parseValuesGridContent(content: unknown) {
  const c = asRecord(content);
  const valuesEyebrow = asString(c.eyebrow, DEFAULT_MVV_VALUES_EYEBROW).trim() || DEFAULT_MVV_VALUES_EYEBROW;
  const valuesEyebrowIcon =
    asString(c.eyebrow_icon, DEFAULT_MVV_VALUES_EYEBROW_ICON).trim() || DEFAULT_MVV_VALUES_EYEBROW_ICON;
  const valuesTitle = asString(c.title, DEFAULT_MVV_VALUES_TITLE).trim() || DEFAULT_MVV_VALUES_TITLE;

  let values: MvvValueItem[] = [];
  if (Array.isArray(c.items)) {
    values = c.items
      .map((item, idx) => normalizeValueItem(item, idx))
      .filter((v): v is MvvValueItem => v !== null);
  }
  if (values.length === 0) {
    values = DEFAULT_MVV_VALUE_ITEMS.map((v) => ({ ...v }));
  }

  const bgSlides = Array.isArray(c.bg_slides)
    ? c.bg_slides.filter((url): url is string => typeof url === "string" && url.trim() !== "")
    : DEFAULT_MVV_BG_SLIDES;

  return {
    valuesEyebrow,
    valuesEyebrowIcon,
    valuesTitle,
    values,
    bgSlides: bgSlides.length > 0 ? bgSlides : DEFAULT_MVV_BG_SLIDES,
  };
}
