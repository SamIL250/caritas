function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type RichTextFigureAttrs = {
  src: string;
  alt?: string;
  caption: string;
  imageClass?: string;
};

/** Stored HTML for an inline image with caption in CMS rich text. */
export function buildRichTextFigureHtml({
  src,
  alt,
  caption,
  imageClass = "news-rich-inline-img",
}: RichTextFigureAttrs): string {
  const safeCaption = escapeHtml(caption.trim());
  const safeAlt = escapeHtml((alt ?? caption).trim());
  const safeSrc = escapeHtml(src.trim());
  const safeClass = escapeHtml(imageClass.trim());

  return (
    `<figure class="rich-text-figure" data-rich-text-figure="true">` +
    `<img src="${safeSrc}" alt="${safeAlt}" class="${safeClass}" />` +
    `<figcaption>${safeCaption}</figcaption>` +
    `</figure>`
  );
}

/** Upgrade legacy bare inline images to captioned figures when possible. */
export function enrichRichTextFigures(html: string, imageClass = "news-rich-inline-img"): string {
  if (!html.trim()) return html;

  return html.replace(/<img\b([^>]*?)>/gi, (match, attrs: string, offset: number) => {
      const before = html.slice(0, offset);
      const lastFigureOpen = before.lastIndexOf("<figure");
      const lastFigureClose = before.lastIndexOf("</figure>");
      if (lastFigureOpen > lastFigureClose) return match;

      if (/data-rich-text-figure/i.test(attrs)) return match;
      const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
      if (!srcMatch) return match;

      const classMatch = attrs.match(/\bclass=["']([^"']*)["']/i);
      const classes = classMatch?.[1] ?? "";
      const isInlineRichText =
        classes.includes("news-rich-inline-img") || classes.includes("program-rich-inline-img");
      if (!isInlineRichText) return match;

      const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
      const alt = altMatch?.[1]?.trim() ?? "";
      const caption = alt || "Image";

      return buildRichTextFigureHtml({
        src: srcMatch[1],
        alt,
        caption,
        imageClass: classes.includes("program-rich-inline-img") ? "program-rich-inline-img" : imageClass,
      });
    },
  );
}
