"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { X, Upload, Search, Check, Loader2, ChevronRight, Folder as FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getMedia, uploadMedia, listMediaFolders } from "@/app/actions/media";
import type { MediaFolderRow } from "@/app/actions/media";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size_bytes: number;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multi?: boolean;
  /** When set, new uploads from this picker go into this folder */
  uploadFolderId?: string | null;
}

function buildFolderChain(currentId: string | null, flat: MediaFolderRow[]): MediaFolderRow[] {
  if (!currentId) return [];
  const map = new Map(flat.map((f) => [f.id, f]));
  const chain: MediaFolderRow[] = [];
  let cur: MediaFolderRow | undefined = map.get(currentId);
  while (cur) {
    chain.unshift(cur);
    cur = cur.parent_id ? map.get(cur.parent_id) : undefined;
  }
  return chain;
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  multi = false,
  uploadFolderId: uploadFolderIdProp,
}: MediaPickerProps) {
  const [foldersFlat, setFoldersFlat] = useState<MediaFolderRow[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const uploadIntoId = uploadFolderIdProp !== undefined ? uploadFolderIdProp : currentFolderId;

  const crumbs = useMemo(
    () => buildFolderChain(currentFolderId, foldersFlat),
    [currentFolderId, foldersFlat],
  );

  const childFolders = useMemo(() => {
    return foldersFlat.filter((f) =>
      currentFolderId === null ? f.parent_id === null : f.parent_id === currentFolderId,
    );
  }, [foldersFlat, currentFolderId]);

  const loadFoldersAndMedia = useCallback(async () => {
    setLoading(true);
    setUploadError(null);
    try {
      const [folds, rows] = await Promise.all([
        listMediaFolders(),
        getMedia({ folderId: currentFolderId }),
      ]);
      setFoldersFlat(folds);
      setMedia(rows as MediaItem[]);
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : "Could not load media.");
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const tid = window.setTimeout(() => {
      if (cancelled) return;
      void loadFoldersAndMedia();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(tid);
    };
  }, [isOpen, loadFoldersAndMedia]);

  useEffect(() => {
    if (isOpen) return;
    const t = window.setTimeout(() => {
      setSearch("");
      setSelectedIds([]);
      setCurrentFolderId(null);
    }, 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (uploadIntoId) {
        formData.append("folder_id", uploadIntoId);
      }
      const newMedia = await uploadMedia(formData);
      const item = newMedia as MediaItem;
      setMedia((prev) => [item, ...prev]);
      if (!multi) setSelectedIds([item.id]);
      else setSelectedIds((prev) => [...prev, item.id]);
      void loadFoldersAndMedia();
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const filteredMedia = media.filter((item) =>
    item.filename.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredFolders = childFolders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSelect = (id: string) => {
    if (multi) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    } else {
      setSelectedIds([id]);
    }
  };

  const handleConfirm = () => {
    const selectedItems = media.filter((m) => selectedIds.includes(m.id));
    onSelect(multi ? selectedItems : selectedItems[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 p-6">
          <h2 className="text-xl font-bold text-stone-900">Media library</h2>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={24} aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-stone-50 bg-stone-50/50 px-6 py-4">
          <nav className="flex flex-wrap items-center gap-1 text-xs font-semibold text-stone-600">
            <button
              type="button"
              className={`rounded-lg px-2 py-1 hover:bg-white hover:text-[#7A1515] ${currentFolderId === null ? "bg-white text-[#7A1515]" : ""}`}
              onClick={() => setCurrentFolderId(null)}
            >
              Library root
            </button>
            {crumbs.map((f) => (
              <span key={f.id} className="flex items-center gap-1">
                <ChevronRight size={14} className="text-stone-300" aria-hidden />
                <button
                  type="button"
                  className={`rounded-lg px-2 py-1 hover:bg-white hover:text-[#7A1515] ${currentFolderId === f.id ? "bg-white text-[#7A1515]" : ""}`}
                  onClick={() => setCurrentFolderId(f.id)}
                >
                  {f.name}
                </button>
              </span>
            ))}
          </nav>

          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} aria-hidden />
              <input
                type="text"
                placeholder="Search folders & files in this location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-10 pr-4 focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
              />
            </div>
            <label className="cursor-pointer">
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
              <div
                className={`flex items-center gap-2 rounded-xl border-2 border-dashed border-stone-200 px-6 py-2 font-medium text-stone-500 hover:border-[#7A1515] hover:text-[#7A1515] ${uploading ? "opacity-50" : ""}`}
              >
                {uploading ? <Loader2 className="animate-spin" size={18} aria-hidden /> : <Upload size={18} aria-hidden />}
                {uploading ? "Uploading…" : "Upload here"}
              </div>
            </label>
          </div>
        </div>

        {uploadError ? (
          <p role="alert" className="border-b border-red-100 bg-red-50 px-6 py-2 text-sm text-red-700">
            {uploadError}
          </p>
        ) : null}

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-stone-400">
              <Loader2 className="animate-spin" size={32} aria-hidden />
            </div>
          ) : (
            <>
              {filteredFolders.length > 0 ? (
                <div className="mb-6">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">Folders</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {filteredFolders.map((folder) => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => setCurrentFolderId(folder.id)}
                        className="flex flex-col items-start gap-2 rounded-xl border border-stone-200 bg-amber-50/40 p-3 text-left transition-colors hover:border-[#7A1515]/40 hover:bg-amber-50"
                      >
                        <FolderIcon size={22} className="text-amber-700" aria-hidden />
                        <span className="line-clamp-2 text-xs font-bold text-stone-800">{folder.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">Images here</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredMedia.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelect(item.id)}
                    className={`group relative aspect-square overflow-hidden rounded-xl border-4 transition-all ${
                      selectedIds.includes(item.id) ? "border-[#7A1515]" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                    {selectedIds.includes(item.id) ? (
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#7A1515] text-white">
                        <Check size={14} aria-hidden />
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>

              {!filteredMedia.length && !filteredFolders.length ? (
                <p className="py-12 text-center text-sm text-stone-400">Nothing matches your search in this folder.</p>
              ) : null}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 p-6">
          <div className="text-sm text-stone-500">{selectedIds.length} selected</div>
          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={handleConfirm} disabled={selectedIds.length === 0}>
              Select
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
