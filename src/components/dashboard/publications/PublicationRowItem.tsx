"use client";

import Link from "next/link";
import {
  Pencil,
  Trash2,
  ExternalLink,
  FileText,
  Star,
  Newspaper,
  Image as ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  encodePublicationAssetUrl,
  publicationHasPdf,
  type PublicationCategoryRow,
  type PublicationRow,
} from "@/lib/publications";

type Props = {
  row: PublicationRow;
  category: PublicationCategoryRow | undefined;
  onDelete: (id: string) => void;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function CoverThumb({ url, alt, hint }: { url: string; alt: string; hint: "pdf" | "story" | "external" }) {
  if (url.trim()) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={encodePublicationAssetUrl(url)}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    );
  }
  const Glyph = hint === "story" ? Newspaper : hint === "external" ? ImageIcon : FileText;
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-50">
      <Glyph className="size-7 text-stone-300/90" strokeWidth={1.25} aria-hidden />
    </div>
  );
}

export function PublicationRowItem({ row, category, onDelete }: Props) {
  const kindHint: "pdf" | "story" | "external" =
    category?.kind === "story" ? "story" : category?.kind === "external" ? "external" : "pdf";

  const meta: string[] = [];
  if (row.period_label.trim()) meta.push(row.period_label.trim());
  if (publicationHasPdf(row)) meta.push("PDF");
  else if (row.external_url.trim()) meta.push("Link");
  if (row.published_at) meta.push(formatDate(row.published_at));

  return (
    <article className="group flex flex-col gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-stone-100/65 sm:flex-row sm:items-center sm:gap-5 sm:py-4 sm:pr-4">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-stone-100/70 sm:aspect-auto sm:h-[5.25rem] sm:w-[8.25rem]">
        <CoverThumb
          url={row.cover_image_url}
          alt={row.cover_image_alt || row.title}
          hint={kindHint}
        />
      </div>
      <div className="min-w-0 flex-1 px-2 sm:px-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-stone-900">{row.title}</span>
          {row.featured ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
              <Star className="size-2.5 fill-amber-500 text-amber-500" aria-hidden /> Featured
            </span>
          ) : null}
          <Badge variant={row.status === "published" ? "success" : "warning"}>
            {row.status === "published" ? "Published" : "Draft"}
          </Badge>
          {category ? (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
              {category.label}
            </span>
          ) : null}
        </div>
        {row.excerpt.trim() ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{row.excerpt}</p>
        ) : null}
        {meta.length ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-400">
            {meta.map((m, i) => (
              <span key={`${m}-${i}`} className="inline-flex items-center gap-1.5">
                {i > 0 ? <span aria-hidden>·</span> : null}
                {m}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-0.5 px-2 sm:w-auto sm:px-0">
        {row.file_url.trim() ? (
          <a
            href={encodePublicationAssetUrl(row.file_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2.5 text-stone-400 transition-colors hover:bg-white/75 hover:text-stone-700"
            aria-label="Open PDF"
            title="Open PDF"
          >
            <FileText size={17} />
          </a>
        ) : null}
        {row.external_url.trim() ? (
          <a
            href={row.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2.5 text-stone-400 transition-colors hover:bg-white/75 hover:text-stone-700"
            aria-label="Open external link"
            title="Open external link"
          >
            <ExternalLink size={17} />
          </a>
        ) : null}
        <Link
          href={`/dashboard/publications/${row.id}`}
          className="rounded-lg p-2.5 text-stone-500 transition-colors hover:bg-white/75 hover:text-[#7A1515]"
          aria-label={`Edit ${row.title}`}
        >
          <Pencil size={17} />
        </Link>
        <button
          type="button"
          className="rounded-lg p-2.5 text-stone-400 transition-colors hover:bg-red-50/90 hover:text-red-600"
          onClick={() => onDelete(row.id)}
          aria-label={`Delete ${row.title}`}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}
