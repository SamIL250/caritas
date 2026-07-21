"use client";

import Link from "next/link";
import { ExternalLink, Pencil, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { encodeTestimonyAssetUrl, testimonyDetailHref, type TestimonyRow } from "@/lib/testimonies";

type Props = {
  row: TestimonyRow;
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

export function TestimonyRowItem({ row, onDelete }: Props) {
  const cover = row.cover_image_url.trim();

  return (
    <article className="group flex flex-col gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-stone-100/65 sm:flex-row sm:items-center sm:gap-5 sm:py-4 sm:pr-4">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-stone-100/70 sm:aspect-auto sm:h-[5.25rem] sm:w-[8.25rem]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={encodeTestimonyAssetUrl(cover)}
            alt={row.cover_image_alt || row.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-50">
            <User className="size-7 text-stone-300/90" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 px-2 sm:px-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-stone-900">{row.title}</span>
          <Badge variant={row.status === "published" ? "success" : "warning"}>
            {row.status === "published" ? "Published" : "Draft"}
          </Badge>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
            Testimony
          </span>
        </div>
        {row.excerpt.trim() ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{row.excerpt}</p>
        ) : null}
        <div className="mt-1.5 text-[11px] text-stone-400">
          {row.published_at ? formatDate(row.published_at) : "Not scheduled"}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-0.5 px-2 sm:w-auto sm:px-0">
        {row.status === "published" ? (
          <a
            href={testimonyDetailHref(row)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2.5 text-stone-400 transition-colors hover:bg-white/75 hover:text-stone-700"
            aria-label="View on site"
            title="View on site"
          >
            <ExternalLink size={17} />
          </a>
        ) : null}
        <Link
          href={`/dashboard/publications/testimonies/${row.id}`}
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
