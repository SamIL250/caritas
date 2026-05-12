"use client";

type Props = {
  icon?: string | null;
  accent?: string | null;
  size?: number;
  className?: string;
};

/**
 * Small accent pill for FontAwesome category icons (program areas).
 * Mirrors PublicationCategoryIcon for visual consistency.
 */
export function ProgramCategoryIcon({ icon, accent, size = 36, className = "" }: Props) {
  const fa = (icon && icon.trim()) || "fa-solid fa-folder";
  const isHex = accent && /^#[0-9a-fA-F]{3,8}$/.test(accent);
  const bg = isHex ? `${accent}1A` : "#7A15151A";
  const fg = isHex ? (accent as string) : "#7A1515";
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
