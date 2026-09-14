/**
 * Site-wide typography controls (dashboard → Typography).
 *
 * Two knobs, stored in `site_settings.options.typography`:
 *  - `scale`      multiplies the root font size, so every `rem` size on the
 *                 public site grows or shrinks together and the design's
 *                 relative hierarchy is preserved.
 *  - `minTextRem` a readability floor applied only to small text. Public CSS
 *                 declares small sizes as `max(var(--cr-text-min, 0rem), Xrem)`,
 *                 so raising the floor lifts only the text below it and leaves
 *                 larger text untouched.
 */

export type TypographySettings = {
  /** Root font-size multiplier. 1 = browser default (16px). */
  scale: number;
  /** Minimum size for small text, in rem. 0 disables the floor. */
  minTextRem: number;
};

export const TYPOGRAPHY_DEFAULTS: TypographySettings = {
  scale: 1,
  minTextRem: 0,
};

export const SCALE_MIN = 0.9;
export const SCALE_MAX = 1.4;
export const MIN_TEXT_REM_MAX = 1.05;

/** Scale choices surfaced in the dashboard. */
export const SCALE_PRESETS: { value: number; label: string; hint: string }[] = [
  { value: 1, label: "100%", hint: "Default" },
  { value: 1.05, label: "105%", hint: "Slightly larger" },
  { value: 1.1, label: "110%", hint: "Larger" },
  { value: 1.15, label: "115%", hint: "Much larger" },
  { value: 1.25, label: "125%", hint: "Maximum comfort" },
];

/** Floor choices surfaced in the dashboard. Approx px shown at 100% scale. */
export const MIN_TEXT_PRESETS: { value: number; label: string; hint: string }[] = [
  { value: 0, label: "Off", hint: "Keep original small sizes" },
  { value: 0.75, label: "12px", hint: "Lift the smallest labels" },
  { value: 0.8, label: "12.8px", hint: "Recommended" },
  { value: 0.85, label: "13.6px", hint: "Stronger" },
  { value: 0.9, label: "14.4px", hint: "Strongest" },
];

function clampNumber(raw: unknown, min: number, max: number, fallback: number): number {
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? ""));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n * 1000) / 1000));
}

/** Coerce arbitrary JSON into safe, in-range typography settings. */
export function mergeTypographySettings(
  raw: unknown,
): TypographySettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...TYPOGRAPHY_DEFAULTS };
  }
  const src = raw as Record<string, unknown>;
  return {
    scale: clampNumber(src.scale, SCALE_MIN, SCALE_MAX, TYPOGRAPHY_DEFAULTS.scale),
    minTextRem: clampNumber(
      src.minTextRem,
      0,
      MIN_TEXT_REM_MAX,
      TYPOGRAPHY_DEFAULTS.minTextRem,
    ),
  };
}

/** Read typography out of the `site_settings.options` JSON blob. */
export function parseTypographyFromOptions(options: unknown): TypographySettings {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return { ...TYPOGRAPHY_DEFAULTS };
  }
  return mergeTypographySettings((options as Record<string, unknown>).typography);
}

export function isDefaultTypography(settings: TypographySettings): boolean {
  return (
    settings.scale === TYPOGRAPHY_DEFAULTS.scale &&
    settings.minTextRem === TYPOGRAPHY_DEFAULTS.minTextRem
  );
}

/**
 * CSS injected into the public site only. Values are numeric and re-clamped
 * here, so nothing user-supplied is interpolated verbatim into the stylesheet.
 */
export function buildTypographyCss(settings: TypographySettings): string {
  const { scale, minTextRem } = mergeTypographySettings(settings);
  const lines = [
    ":root{",
    `--cr-text-scale:${scale};`,
    `--cr-text-min:${minTextRem}rem;`,
    "}",
    "html{font-size:calc(100% * var(--cr-text-scale, 1));}",
  ];
  return lines.join("");
}
