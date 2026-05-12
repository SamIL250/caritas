"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Lock } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { type PublicationCategoryRow } from "@/lib/publications";
import { PublicationCategoryIcon } from "./PublicationCategoryIcon";
import { deletePublicationCategory } from "@/app/actions/publication-categories";

export function PublicationsCategoriesPanel({
  categories,
}: {
  categories: PublicationCategoryRow[];
}) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<PublicationCategoryRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      setError(null);
      const r = await deletePublicationCategory(deleteTarget.id);
      if (r.error) {
        setError(r.error);
      } else {
        setDeleteTarget(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2 text-sm leading-relaxed text-stone-600">
          <p>
            Categories drive the dashboard tabs, the form fields, and the public sections on{" "}
            <a
              href="/publications"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#7A1515] underline underline-offset-2"
            >
              /publications
            </a>
            . Built-in categories are locked but you can rename them, change icons or extend with extra
            fields.
          </p>
        </div>
        <Link
          href="/dashboard/publications/categories/new"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-1"
        >
          <Plus className="size-4" aria-hidden /> New category
        </Link>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">Custom fields</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories.map((c) => {
              const fields = Array.isArray(c.field_schema) ? c.field_schema.length : 0;
              return (
                <tr key={c.id} className="hover:bg-stone-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <PublicationCategoryIcon icon={c.icon} accent={c.accent} size={28} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-stone-900">{c.label}</span>
                          {c.is_system ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-stone-500"
                              title="Built-in category"
                            >
                              <Lock className="size-2.5" aria-hidden /> Built-in
                            </span>
                          ) : null}
                        </div>
                        {c.description ? (
                          <p className="mt-0.5 max-w-md text-xs text-stone-500">{c.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{c.slug}</td>
                  <td className="px-4 py-3 text-xs text-stone-600">{c.kind}</td>
                  <td className="px-4 py-3 text-xs text-stone-600">
                    {fields ? `${fields} field${fields === 1 ? "" : "s"}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/dashboard/publications/categories/${c.id}`}
                        className="inline-flex rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-[#7A1515]"
                        aria-label={`Edit ${c.label}`}
                      >
                        <Pencil size={16} />
                      </Link>
                      {c.is_system ? (
                        <span
                          className="inline-flex rounded-lg p-2 text-stone-300"
                          title="Built-in categories can't be deleted"
                        >
                          <Trash2 size={16} />
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteTarget(c)}
                          aria-label={`Delete ${c.label}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete category?"
        description={`Delete “${deleteTarget?.label ?? ""}”? Existing publications must be reassigned or deleted first.`}
        confirmLabel={busy ? "Deleting…" : "Delete"}
      />
    </div>
  );
}
