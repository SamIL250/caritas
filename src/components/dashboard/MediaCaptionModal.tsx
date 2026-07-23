"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

export type MediaCaptionDraft = {
  key: string;
  label: string;
  previewUrl?: string;
  caption: string;
};

type Props = {
  open: boolean;
  title: string;
  description?: string;
  items: MediaCaptionDraft[];
  requireCaptions?: boolean;
  onCancel: () => void;
  onConfirm: (captionsByKey: Record<string, string>) => void;
};

export function MediaCaptionModal({
  open,
  title,
  description,
  items,
  requireCaptions = false,
  onCancel,
  onConfirm,
}: Props) {
  const [drafts, setDrafts] = useState<MediaCaptionDraft[]>(items);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDrafts(items);
    setError(null);
  }, [open, items]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function updateCaption(key: string, caption: string) {
    setDrafts((prev) => prev.map((item) => (item.key === key ? { ...item, caption } : item)));
  }

  function handleConfirm() {
    if (requireCaptions) {
      const missing = drafts.find((item) => !item.caption.trim());
      if (missing) {
        setError("Every image needs a caption before continuing.");
        return;
      }
    }
    setError(null);
    onConfirm(Object.fromEntries(drafts.map((item) => [item.key, item.caption.trim()])));
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-caption-modal-title"
        className="flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-stone-100 p-6">
          <h2 id="media-caption-modal-title" className="text-lg font-bold text-stone-900">
            {title}
          </h2>
          {description ? <p className="mt-1 text-sm text-stone-500">{description}</p> : null}
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
          {drafts.map((item) => (
            <div key={item.key} className="rounded-xl border border-stone-200 p-4">
              <div className="mb-3 flex items-start gap-3">
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-800">{item.label}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {requireCaptions
                      ? "This caption appears below the image on the public site."
                      : "Optional. Add a caption if this image should show one on the public site."}
                  </p>
                </div>
              </div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Caption{requireCaptions ? "" : " (optional)"}
                <textarea
                  value={item.caption}
                  onChange={(e) => updateCaption(item.key, e.target.value)}
                  rows={2}
                  placeholder="Describe what is shown in the image…"
                  className="mt-1.5 w-full resize-y rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
                />
              </label>
            </div>
          ))}
        </div>

        {error ? (
          <p role="alert" className="border-t border-red-100 bg-red-50 px-6 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-stone-100 p-6">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm}>
            Continue
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
