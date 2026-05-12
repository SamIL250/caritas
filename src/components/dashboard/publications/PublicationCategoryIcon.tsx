"use client";

type Props = {
  icon?: string | null;
  accent?: string | null;
  size?: number;
  className?: string;
};

/**
 * Renders the FontAwesome class on a small accent-coloured pill so the
 * dashboard can show category iconography even though FA classes come from
 * the website CSS. Falls back to a generic file glyph.
 */
export function PublicationCategoryIcon({ icon, accent, size = 36, className = "" }: Props) {
  const fa = (icon && icon.trim()) || "fa-solid fa-file-lines";
  const bg = accent && /^#[0-9a-fA-F]{3,8}$/.test(accent) ? `${accent}1A` : "#7A15151A";
  const fg = accent && /^#[0-9a-fA-F]{3,8}$/.test(accent) ? accent : "#7A1515";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: Math.round(size * 0.45),
      }}
      aria-hidden
    >
      <i className={fa} />
    </span>
  );
}
