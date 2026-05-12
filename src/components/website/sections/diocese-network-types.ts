/** About page network section — diocese tiles + optional detail modal (see reference `about.html`). */

export type NetStat = {
  number: string;
  label: string;
};

/** Fields shown in the diocese detail dialog (matches `about.html` modal body). */
export type DioceseModalDetail = {
  founded?: string | null;
  bishop?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  website_label?: string | null;
};

export type DioceseCard = {
  name: string;
  date_line: string;
  /** Public URL under /img/… or absolute URL */
  image?: string;
  /** Nyundo pastoral zones layout (gradient, star, no photo) — no Details control in reference */
  special?: boolean;
  /** @deprecated Prefer `special`; kept for older CMS payloads */
  highlight?: boolean;
  icon?: string;
  /**
   * When `modal` has no content, the tile can fall back to navigating here (whole-card link).
   */
  details_href?: string;
  /** Two-digit display index e.g. "01"; defaults to row order */
  number?: string;
  accent_wash?: boolean;
  /** When set, the Details control opens a dialog instead of navigating away */
  modal?: DioceseModalDetail;
};
