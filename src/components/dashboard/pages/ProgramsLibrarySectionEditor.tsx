"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MediaPicker } from "@/components/dashboard/MediaPicker";
import type { ProgramCategoryRow, ProgramRow } from "@/lib/programs";
import type { ProgramBubbleDraft } from "@/app/actions/programs";
import { mergeProgramBubbleDraft } from "@/lib/program-bubble-draft";

type Props = {
  state: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  programs: ProgramRow[];
  categories: ProgramCategoryRow[];
  programDrafts: Record<string, ProgramBubbleDraft>;
  onProgramDraftChange: (programId: string, patch: Partial<ProgramBubbleDraft>) => void;
};

function ProgramBubbleEditor({
  program,
  categoryLabel,
  draft,
  onDraftChange,
}: {
  program: ProgramRow;
  categoryLabel: string;
  draft: ProgramBubbleDraft;
  onDraftChange: (patch: Partial<ProgramBubbleDraft>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);

  return (
    <li className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-stone-50"
      >
        <div className="min-w-0">
          <div className="truncate text-xs font-bold text-stone-800">{draft.title || program.title}</div>
          <div className="text-[10px] text-stone-400">{categoryLabel}</div>
        </div>
        {open ? (
          <ChevronUp size={16} className="shrink-0 text-stone-400" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-stone-400" />
        )}
      </button>

      {open ? (
        <div className="space-y-4 border-t border-stone-100 p-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
              Project period (top of circle)
            </label>
            <input
              type="text"
              value={draft.project_period}
              onChange={(e) => onDraftChange({ project_period: e.target.value })}
              placeholder="May 3, 2025 - April 2027"
              className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
              Carried by (below period)
            </label>
            <input
              type="text"
              value={draft.carried_by}
              onChange={(e) => onDraftChange({ carried_by: e.target.value })}
              placeholder="By Secours Catholique in Cyangugu and Gikongoro"
              className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Title</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => onDraftChange({ title: e.target.value })}
              className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Subtitle</label>
            <input
              type="text"
              value={draft.subtitle}
              onChange={(e) => onDraftChange({ subtitle: e.target.value })}
              className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
              Short description (truncated on circle)
            </label>
            <textarea
              rows={3}
              value={draft.excerpt}
              onChange={(e) => onDraftChange({ excerpt: e.target.value })}
              className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Circle image</label>
            <div className="flex items-center gap-2 rounded-lg border border-stone-100 bg-stone-50 p-2">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-stone-200">
                {draft.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.cover_image_url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <Button
                type="button"
                variant="secondary"
                className="h-8 px-2 text-[10px]"
                onClick={() => setCoverPickerOpen(true)}
              >
                <ImagePlus size={14} className="mr-1" />
                Choose image
              </Button>
            </div>
          </div>

          <Link
            href={`/dashboard/programs/${program.id}`}
            className="inline-flex text-[10px] font-bold text-[#7A1515] hover:underline"
          >
            Full program editor →
          </Link>
        </div>
      ) : null}

      <MediaPicker
        isOpen={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onSelect={(m) => {
          const url = Array.isArray(m) ? m[0]?.url : m.url;
          if (url) onDraftChange({ cover_image_url: url });
          setCoverPickerOpen(false);
        }}
      />
    </li>
  );
}

export default function ProgramsLibrarySectionEditor({
  state,
  onChange,
  programs,
  categories,
  programDrafts,
  onProgramDraftChange,
}: Props) {
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)),
    [categories],
  );

  const publishedPrograms = useMemo(
    () => programs.filter((p) => p.status === "published"),
    [programs],
  );

  return (
    <div className="space-y-6">
      <p className="text-[10px] leading-relaxed text-stone-500">
        Category tabs, panel descriptions, and the Rwanda map stay dynamic from program categories.
        Each circle uses a fixed layout: period, carried by, title/subtitle, then a short preview — click opens the drawer for full details.
      </p>

      <div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Section settings</p>
        <label className="block space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Circles shown initially</span>
          <input
            type="number"
            min={1}
            max={12}
            value={Number(state.bubble_initial_count ?? 3)}
            onChange={(e) => onChange("bubble_initial_count", Math.min(12, Math.max(1, Number(e.target.value) || 3)))}
            className="h-8 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">View all label</span>
          <input
            type="text"
            value={String(state.view_all_label ?? "View All Programs")}
            onChange={(e) => onChange("view_all_label", e.target.value)}
            className="h-8 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Show less label</span>
          <input
            type="text"
            value={String(state.view_all_less_label ?? "Show Less")}
            onChange={(e) => onChange("view_all_less_label", e.target.value)}
            className="h-8 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-stone-600">
          <input
            type="checkbox"
            checked={state.show_success_stories !== false}
            onChange={(e) => onChange("show_success_stories", e.target.checked)}
            className="rounded border-stone-300 text-[#7A1515]"
          />
          Show success stories block
        </label>
        <label className="flex items-center gap-2 text-xs text-stone-600">
          <input
            type="checkbox"
            checked={state.show_news !== false}
            onChange={(e) => onChange("show_news", e.target.checked)}
            className="rounded border-stone-300 text-[#7A1515]"
          />
          Show latest news block
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Project circles</p>
          <Link href="/dashboard/programs" className="text-[10px] font-bold text-[#7A1515] hover:underline">
            Manage programs →
          </Link>
        </div>

        {publishedPrograms.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-200 px-3 py-4 text-[11px] text-stone-500">
            No published programs yet. Add programs in Dashboard → Programs.
          </p>
        ) : (
          sortedCategories.map((cat) => {
            const catPrograms = publishedPrograms.filter((p) => p.category === cat.slug);
            if (!catPrograms.length) return null;
            return (
              <div key={cat.id} className="space-y-2">
                <p className="text-[10px] font-bold text-stone-600">{cat.plural_label || cat.label}</p>
                <ul className="space-y-2">
                  {catPrograms.map((program) => (
                    <ProgramBubbleEditor
                      key={program.id}
                      program={program}
                      categoryLabel={cat.label}
                      draft={mergeProgramBubbleDraft(program, programDrafts[program.id])}
                      onDraftChange={(patch) => onProgramDraftChange(program.id, patch)}
                    />
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
