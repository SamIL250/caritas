/**
 * Detects if a background color is “dark” so foreground can switch to light text (WCAG-style luminance).
 * Supports #rgb, #rrggbb, and rgb() / rgba().
 */
function parseToRgb(
  input: string
): { r: number; g: number; b: number } | null {
  const s = input.trim();
  if (!s) return null;
  const hex3 = s.match(/^#?([0-9a-f]{3})$/i);
  if (hex3) {
    const h = hex3[1]
      .split("")
      .map((c) => c + c)
      .join("");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }
  const hex6 = s.match(/^#?([0-9a-f]{6})$/i);
  if (hex6) {
    const h = hex6[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }
  const rgb = s.match(
    /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i
  );
  if (rgb) {
    return {
      r: Math.min(255, +rgb[1]),
      g: Math.min(255, +rgb[2]),
      b: Math.min(255, +rgb[3])
    };
  }
  return null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const f = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Use light foreground when background is darker than this relative luminance (sRGB). */
const DARK_BG_THRESHOLD = 0.5;

/**
 * Returns true if `bg` reads as a dark color — use for switching to light text on CTA, etc.
 */
export function isDarkBackgroundColor(bg: string): boolean {
  const rgb = parseToRgb(bg);
  if (!rgb) return false;
  return relativeLuminance(rgb.r, rgb.g, rgb.b) < DARK_BG_THRESHOLD;
}
