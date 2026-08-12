"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Upload,
  Search,
  Check,
  Loader2,
  ChevronRight,
  Folder as FolderIcon,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getMediaPage, listMediaFolders } from "@/app/actions/media";
import type { MediaFolderRow } from "@/app/actions/media";
import { cloudinaryUrl } from "@/lib/cloudinary-url";
import { MediaCaptionModal, type MediaCaptionDraft } from "@/components/dashboard/MediaCaptionModal";

export interface PickedMediaItem {
  id: string;
  url: string;
  filename: string;
  size_bytes: number;
  mime_type: string | null;
  caption?: string | null;
  alt_text?: string | null;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: PickedMediaItem | PickedMediaItem[]) => void;
  multi?: boolean;
  /** When set, new uploads from this picker go into this folder */
  uploadFolderId?: string | null;
}

type PendingImageUpload = {
  file: File;
  previewUrl: string;
};

type UploadCaptionFlow = {
  files: PendingImageUpload[];
  otherFiles: File[];
};

const PAGE_SIZE = 15;

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

function isImageItem(item: Pick<PickedMediaItem, "mime_type">): boolean {
  return Boolean(item.mime_type?.startsWith("image/"));
}

function toPicked(row: {
  id: string;
  url: string;
  filename: string;
  size_bytes: number;
  mime_type: string | null;
  caption?: string | null;
  alt_text?: string | null;
}): PickedMediaItem {
  return {
    id: row.id,
    url: row.url,
    filename: row.filename,
    size_bytes: row.size_bytes,
    mime_type: row.mime_type,
    caption: row.caption ?? null,
    alt_text: row.alt_text ?? null,
  };
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

  const [media, setMedia] = useState<PickedMediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedMap, setSelectedMap] = useState<Record<string, PickedMediaItem>>({});
  const [uploadCaptionFlow, setUploadCaptionFlow] = useState<UploadCaptionFlow | null>(null);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [mounted, setMounted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  const uploadIntoId = uploadFolderIdProp !== undefined ? uploadFolderIdProp : currentFolderId;
  const selectedIds = useMemo(() => Object.keys(selectedMap), [selectedMap]);
  const selectedCount = selectedIds.length;

  const crumbs = useMemo(
    () => buildFolderChain(currentFolderId, foldersFlat),
    [currentFolderId, foldersFlat],
  );

  const childFolders = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return foldersFlat
      .filter((f) =>
        currentFolderId === null ? f.parent_id === null : f.parent_id === currentFolderId,
      )
      .filter((f) => (!q ? true : f.name.toLowerCase().includes(q)));
  }, [foldersFlat, currentFolderId, debouncedSearch]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tid = window.setTimeout(() => setDebouncedSearch(search), 280);
    return () => window.clearTimeout(tid);
  }, [search]);

  const loadFolders = useCallback(async () => {
    const folds = await listMediaFolders();
    setFoldersFlat(folds);
  }, []);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setUploadError(null);
    setShowLoadMore(false);
    try {
      const [folds, page] = await Promise.all([
        listMediaFolders(),
        getMediaPage({
          folderId: currentFolderId,
          search: debouncedSearch,
          limit: PAGE_SIZE,
          offset: 0,
        }),
      ]);
      setFoldersFlat(folds);
      setMedia(page.items.map(toPicked));
      setTotal(page.total);
      setHasMore(page.hasMore);
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : "Could not load media.");
      setMedia([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, debouncedSearch]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    setUploadError(null);
    try {
      const page = await getMediaPage({
        folderId: currentFolderId,
        search: debouncedSearch,
        limit: PAGE_SIZE,
        offset: media.length,
      });
      setMedia((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const next = page.items.map(toPicked).filter((m) => !seen.has(m.id));
        return [...prev, ...next];
      });
      setTotal(page.total);
      setHasMore(page.hasMore);
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : "Could not load more media.");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, hasMore, currentFolderId, debouncedSearch, media.length]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const tid = window.setTimeout(() => {
      if (cancelled) return;
      void loadFirstPage();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(tid);
    };
  }, [isOpen, loadFirstPage]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    const t = window.setTimeout(() => {
      setSearch("");
      setDebouncedSearch("");
      setSelectedMap({});
      setCurrentFolderId(null);
      setUploadCaptionFlow(null);
      setMedia([]);
      setTotal(0);
      setHasMore(false);
      setShowLoadMore(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  /* Reveal Load more when the user scrolls near the bottom */
  useEffect(() => {
    if (!isOpen || !hasMore || loading) return;
    const root = scrollRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!root || !sentinel) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShowLoadMore(true);
        }
      },
      { root, rootMargin: "120px", threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [isOpen, hasMore, loading, media.length]);

  async function uploadFiles(files: File[], captionsByName: Record<string, string>) {
    setUploading(true);
    setUploadError(null);
    try {
      const uploadedItems = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          if (uploadIntoId) {
            fd.append("folder_id", uploadIntoId);
          }
          if (file.type.startsWith("image/")) {
            fd.append("caption", captionsByName[file.name] ?? "");
          }

          const res = await fetch("/api/upload", { method: "POST", body: fd });
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.error || `Upload failed (${res.status})`);
          }

          return (await res.json()) as PickedMediaItem;
        }),
      );

      setMedia((prev) => [...uploadedItems, ...prev]);
      setTotal((t) => t + uploadedItems.length);

      setSelectedMap((prev) => {
        const next = multi ? { ...prev } : {};
        for (const item of uploadedItems) next[item.id] = item;
        return next;
      });

      void loadFolders();
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const otherFiles = files.filter((file) => !file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      setUploadCaptionFlow({
        files: imageFiles.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
        otherFiles,
      });
      return;
    }

    void uploadFiles(otherFiles, {});
  }

  const uploadCaptionModalItems: MediaCaptionDraft[] = useMemo(() => {
    if (!uploadCaptionFlow) return [];
    return uploadCaptionFlow.files.map(({ file, previewUrl }) => ({
      key: file.name,
      label: file.name,
      previewUrl,
      caption: "",
    }));
  }, [uploadCaptionFlow]);

  async function handleUploadCaptionConfirm(captionsByKey: Record<string, string>) {
    if (!uploadCaptionFlow) return;

    const captionsByName = Object.fromEntries(
      uploadCaptionFlow.files.map(({ file }) => [file.name, captionsByKey[file.name] ?? ""]),
    );
    const allFiles = [
      ...uploadCaptionFlow.files.map(({ file }) => file),
      ...uploadCaptionFlow.otherFiles,
    ];
    setUploadCaptionFlow(null);
    await uploadFiles(allFiles, captionsByName);
  }

  async function finishSelection(items: PickedMediaItem[]) {
    onSelect(multi ? items : items[0]);
    onClose();
  }

  const handleConfirm = async () => {
    const selectedItems = Object.values(selectedMap);
    if (selectedItems.length === 0) return;
    await finishSelection(selectedItems);
  };

  function toggleSelect(item: PickedMediaItem) {
    setSelectedMap((prev) => {
      if (multi) {
        if (prev[item.id]) {
          const next = { ...prev };
          delete next[item.id];
          return next;
        }
        return { ...prev, [item.id]: item };
      }
      return { [item.id]: item };
    });
  }

  function goToFolder(id: string | null) {
    setCurrentFolderId(id);
    setShowLoadMore(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }

  if (!isOpen || !mounted) return null;

  const modal = (
    <>
      <div
        className="fixed inset-0 z-[999999] flex items-center justify-center overscroll-none"
        role="presentation"
      >
        {/* Full-viewport backdrop */}
        <button
          type="button"
          aria-label="Close media library"
          className="absolute inset-0 h-full w-full cursor-default border-0 bg-black/60"
          onClick={onClose}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-picker-title"
          className="relative z-10 flex max-h-[min(90vh,880px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-stone-100 p-5 sm:p-6">
            <div>
              <h2 id="media-picker-title" className="text-xl font-bold text-stone-900">
                Media library
              </h2>
              <p className="mt-0.5 text-xs text-stone-500">
                Pick an existing file or upload here. Image captions are optional.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            >
              <X size={22} aria-hidden />
            </button>
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-b border-stone-50 bg-stone-50/50 px-5 py-4 sm:px-6">
            <nav className="flex flex-wrap items-center gap-1 text-xs font-semibold text-stone-600">
              <button
                type="button"
                className={`rounded-lg px-2 py-1 hover:bg-white hover:text-[#7A1515] ${currentFolderId === null ? "bg-white text-[#7A1515]" : ""}`}
                onClick={() => goToFolder(null)}
              >
                Library root
              </button>
              {crumbs.map((f) => (
                <span key={f.id} className="flex items-center gap-1">
                  <ChevronRight size={14} className="text-stone-300" aria-hidden />
                  <button
                    type="button"
                    className={`rounded-lg px-2 py-1 hover:bg-white hover:text-[#7A1515] ${currentFolderId === f.id ? "bg-white text-[#7A1515]" : ""}`}
                    onClick={() => goToFolder(f.id)}
                  >
                    {f.name}
                  </button>
                </span>
              ))}
            </nav>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  size={18}
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Search folders & files in this location…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
                />
              </div>
              <label className="cursor-pointer shrink-0">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                <div
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-500 hover:border-[#7A1515] hover:text-[#7A1515] ${uploading ? "opacity-50" : ""}`}
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" size={18} aria-hidden />
                  ) : (
                    <Upload size={18} aria-hidden />
                  )}
                  {uploading ? "Uploading…" : "Upload here"}
                </div>
              </label>
            </div>
          </div>

          {uploadError ? (
            <p
              role="alert"
              className="shrink-0 border-b border-red-100 bg-red-50 px-5 py-2 text-sm text-red-700 sm:px-6"
            >
              {uploadError}
            </p>
          ) : null}

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-stone-400">
                <Loader2 className="animate-spin" size={32} aria-hidden />
                <p className="text-xs font-medium uppercase tracking-wider">Loading media…</p>
              </div>
            ) : (
              <>
                {childFolders.length > 0 ? (
                  <div className="mb-6">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Folders
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                      {childFolders.map((folder) => (
                        <button
                          key={folder.id}
                          type="button"
                          onClick={() => goToFolder(folder.id)}
                          className="flex flex-col items-start gap-2 rounded-xl border border-stone-200 bg-amber-50/40 p-3 text-left transition-colors hover:border-[#7A1515]/40 hover:bg-amber-50"
                        >
                          <FolderIcon size={22} className="text-amber-700" aria-hidden />
                          <span className="line-clamp-2 text-xs font-bold text-stone-800">
                            {folder.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Files
                  </p>
                  {total > 0 ? (
                    <p className="text-[11px] font-medium text-stone-400">
                      Showing {media.length} of {total}
                    </p>
                  ) : null}
                </div>

                {media.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
                    {media.map((item) => {
                      const isImage = isImageItem(item);
                      const selected = Boolean(selectedMap[item.id]);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleSelect(item)}
                          className={`group relative overflow-hidden rounded-xl border-4 transition-all ${
                            selected ? "border-[#7A1515]" : "border-transparent hover:border-stone-200"
                          } ${!isImage ? "aspect-auto min-h-[120px]" : "aspect-square"}`}
                        >
                          {isImage ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={cloudinaryUrl(item.url, {
                                  width: 300,
                                  height: 300,
                                  crop: "fill",
                                  quality: "auto",
                                  format: "auto",
                                })}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                              />
                              {item.caption?.trim() ? (
                                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-[10px] italic text-white line-clamp-2">
                                  {item.caption}
                                </span>
                              ) : null}
                            </>
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2 bg-stone-50 p-3 text-center">
                              <div className="flex size-10 items-center justify-center rounded-lg bg-stone-200 text-stone-500">
                                <FileText className="size-5" />
                              </div>
                              <span className="max-w-full truncate text-xs font-medium text-stone-700">
                                {item.filename}
                              </span>
                            </div>
                          )}
                          {selected ? (
                            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#7A1515] text-white shadow">
                              <Check size={14} aria-hidden />
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {!media.length && !childFolders.length ? (
                  <p className="py-12 text-center text-sm text-stone-400">
                    {debouncedSearch.trim()
                      ? "Nothing matches your search in this folder."
                      : "This folder is empty. Upload a file to get started."}
                  </p>
                ) : null}

                {hasMore ? (
                  <div ref={loadMoreSentinelRef} className="mt-6 flex flex-col items-center gap-3 pb-2">
                    {showLoadMore || loadingMore ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-w-[10rem]"
                        disabled={loadingMore}
                        onClick={() => void loadMore()}
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" size={16} aria-hidden />
                            Loading…
                          </>
                        ) : (
                          `Load more (+${PAGE_SIZE})`
                        )}
                      </Button>
                    ) : (
                      <p className="text-[11px] text-stone-400">Scroll for more…</p>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-stone-100 bg-white p-5 sm:p-6">
            <div className="text-sm text-stone-500">
              {selectedCount} selected
              {total > 0 ? (
                <span className="ml-2 text-xs text-stone-400">· {total} in folder</span>
              ) : null}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={() => void handleConfirm()}
                disabled={selectedCount === 0}
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MediaCaptionModal
        open={uploadCaptionFlow !== null}
        title="Add image captions"
        description="Optionally add captions before uploading. Leave blank and click Upload to continue without captions."
        requireCaptions={false}
        confirmLabel="Upload"
        items={uploadCaptionModalItems}
        onCancel={() => setUploadCaptionFlow(null)}
        onConfirm={(captionsByKey) => void handleUploadCaptionConfirm(captionsByKey)}
      />
    </>
  );

  return createPortal(modal, document.body);
}
