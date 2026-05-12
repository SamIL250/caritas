"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCorners,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  ChevronRight,
  Copy,
  Check,
  FolderPlus,
  Folder as FolderIcon,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
  RotateCcw,
  Upload,
  Eraser,
  Pencil,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatBytes } from "@/lib/media-quota";
import type { MediaFolderRow, MediaRow } from "@/app/actions/media";
import {
  createMediaFolder,
  deleteMediaFolder,
  getMedia,
  getMediaUsage,
  listMediaFolders,
  moveMediaToFolder,
  purgeMedia,
  renameMediaFile,
  renameMediaFolder,
  restoreMedia,
  softDeleteMedia,
  uploadMedia,
} from "@/app/actions/media";

function dragFileId(id: string) {
  return `file:${id}`;
}

function dropFolderId(id: string | null) {
  return id === null ? "drop-folder:root" : `drop-folder:${id}`;
}

function DroppableFolderShell({
  folderId,
  folderName,
  onOpen,
  disabled,
  onFolderContextMenu,
}: {
  folderId: string;
  folderName: string;
  onOpen: () => void;
  disabled?: boolean;
  onFolderContextMenu?: (e: React.MouseEvent) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropFolderId(folderId),
    disabled: Boolean(disabled),
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        onFolderContextMenu?.(e);
      }}
      className={`relative flex flex-col items-start gap-2 overflow-hidden rounded-xl border bg-white p-4 text-left shadow-sm transition-all duration-200 ease-out hover:border-[var(--color-primary)]/40 active:scale-[0.99] ${
        isOver
          ? "scale-[1.03] border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/30 shadow-lg shadow-[var(--color-primary)]/10"
          : "border-stone-200"
      }`}
    >
      {isOver ? (
        <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--color-primary)]/12 text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)] backdrop-blur-[1px]">
          Drop here
        </span>
      ) : null}
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
        <FolderIcon size={22} aria-hidden />
      </div>
      <span className="text-sm font-bold text-stone-800 line-clamp-2">{folderName}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Folder</span>
    </button>
  );
}

function DraggableFileCard({
  item,
  trashMode,
  disabledDrag,
  onCtx,
  copiedId,
  onCopy,
}: {
  item: MediaRow;
  trashMode: boolean;
  disabledDrag?: boolean;
  onCtx: (e: React.MouseEvent, item: MediaRow) => void;
  copiedId: string | null;
  onCopy: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragFileId(item.id),
    disabled: disabledDrag || trashMode,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.55 : 1 }
    : { opacity: isDragging ? 0.55 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group touch-none ${trashMode ? "" : "cursor-grab active:cursor-grabbing"}`}
      onContextMenu={(e) => onCtx(e, item)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-2 shadow-sm transition-all hover:border-[var(--color-primary)]/35">
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-stone-50">
        {/* eslint-disable-next-line @next/next/no-img-element -- library thumbnails */}
        <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />

        <div className="pointer-events-none absolute inset-0 bg-black/55 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          <div className="flex h-full items-center justify-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-lg hover:text-[var(--color-primary)]"
              title="Copy URL"
            >
              {copiedId === item.id ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCtx(e, item);
              }}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-lg hover:text-[var(--color-primary)]"
              title="More"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="px-1">
        <p className="truncate text-xs font-bold text-stone-700" title={item.filename}>
          {item.filename}
        </p>
        <p className="mt-0.5 text-[10px] text-stone-400">
          {formatBytes(typeof item.size_bytes === "number" ? item.size_bytes : 0)}
        </p>
      </div>
      </div>
    </div>
  );
}

function DroppableRootZone({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropFolderId(null),
    disabled: Boolean(disabled),
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[280px] rounded-2xl transition-all duration-200 ease-out ${
        isOver
          ? "bg-[var(--color-primary)]/[0.07] ring-4 ring-dashed ring-[var(--color-primary)]/35 shadow-inner"
          : ""
      }`}
    >
      {children}
    </div>
  );
}

function buildBreadcrumbs(currentId: string | null, flat: MediaFolderRow[]): MediaFolderRow[] {
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

async function fetchMediaLibrarySnapshot(folderId: string | null, trash: boolean) {
  const [foldersFlat, mediaRows, usage] = await Promise.all([
    listMediaFolders(),
    trash ? getMedia({ trash: true }) : getMedia({ folderId }),
    getMediaUsage(),
  ]);
  return {
    foldersFlat: foldersFlat as MediaFolderRow[],
    items: mediaRows as MediaRow[],
    usage,
  };
}

export default function MediaLibraryClient({
  initialUsage,
}: {
  initialUsage: { usedBytes: number; maxBytes: number };
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const [usage, setUsage] = useState(initialUsage);
  const [foldersFlat, setFoldersFlat] = useState<MediaFolderRow[]>([]);
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [trashMode, setTrashMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ctxMenu, setCtxMenu] = useState<
    | null
    | {
        x: number;
        y: number;
        kind: "file" | "folder";
        target: MediaRow | MediaFolderRow;
      }
  >(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const renameKindRef = useRef<"file" | "folder">("file");
  const renameIdRef = useRef<string>("");

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [confirmTrashFile, setConfirmTrashFile] = useState<MediaRow | null>(null);
  const [confirmPurgeFile, setConfirmPurgeFile] = useState<MediaRow | null>(null);
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<MediaFolderRow | null>(null);

  const ctxMenuRef = useRef<HTMLDivElement | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await fetchMediaLibrarySnapshot(currentFolderId, trashMode);
      setFoldersFlat(snap.foldersFlat);
      setItems(snap.items);
      setUsage(snap.usage);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load library.");
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, trashMode]);

  useEffect(() => {
    let cancelled = false;
    const tid = window.setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      void fetchMediaLibrarySnapshot(currentFolderId, trashMode)
        .then((snap) => {
          if (cancelled) return;
          setFoldersFlat(snap.foldersFlat);
          setItems(snap.items);
          setUsage(snap.usage);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : "Failed to load library.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(tid);
    };
  }, [currentFolderId, trashMode]);

  useEffect(() => {
    function closeCtx(e: MouseEvent) {
      if (!ctxMenu) return;
      if (ctxMenuRef.current?.contains(e.target as Node)) return;
      setCtxMenu(null);
    }
    window.addEventListener("click", closeCtx);
    return () => window.removeEventListener("click", closeCtx);
  }, [ctxMenu]);

  const childFolders = useMemo(() => {
    return foldersFlat.filter((f) =>
      currentFolderId === null ? f.parent_id === null : f.parent_id === currentFolderId,
    );
  }, [foldersFlat, currentFolderId]);

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(currentFolderId, foldersFlat),
    [currentFolderId, foldersFlat],
  );

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (currentFolderId) fd.append("folder_id", currentFolderId);
      await uploadMedia(fd);
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (trashMode) return;
    const { active, over } = event;
    if (!over) return;
    const aid = String(active.id);
    const oid = String(over.id);
    if (!aid.startsWith("file:")) return;
    if (!oid.startsWith("drop-folder:")) return;
    const mediaId = aid.slice("file:".length);
    const destRaw = oid.slice("drop-folder:".length);
    const folderId = destRaw === "root" ? null : destRaw;

    setError(null);
    try {
      await moveMediaToFolder(mediaId, folderId);
      await reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not move file.");
    }
  }

  function openCtxFile(e: React.MouseEvent, item: MediaRow) {
    setCtxMenu({ x: e.clientX, y: e.clientY, kind: "file", target: item });
  }

  function openCtxFolder(e: React.MouseEvent, folder: MediaFolderRow) {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, kind: "folder", target: folder });
  }

  async function submitRename() {
    const v = renameValue.trim();
    if (!v) return;
    setError(null);
    try {
      if (renameKindRef.current === "folder") {
        await renameMediaFolder(renameIdRef.current, v);
      } else {
        await renameMediaFile(renameIdRef.current, v);
      }
      setRenameOpen(false);
      await reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Rename failed.");
    }
  }

  async function submitNewFolder() {
    const v = newFolderName.trim();
    if (!v) return;
    setError(null);
    try {
      await createMediaFolder(v, currentFolderId);
      setNewFolderOpen(false);
      setNewFolderName("");
      await reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create folder.");
    }
  }

  const usagePct = Math.min(100, (usage.usedBytes / usage.maxBytes) * 100);
  const usageTone =
    usagePct > 92 ? "bg-red-600" : usagePct > 78 ? "bg-amber-500" : "bg-emerald-600";

  const uploadTrigger = (
    <label className="cursor-pointer">
      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading || trashMode} />
      <Button variant="primary" className="pointer-events-none h-9 gap-2" disabled={uploading || trashMode}>
        {uploading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Upload size={16} aria-hidden />}
        {uploading ? "Uploading…" : "Upload"}
      </Button>
    </label>
  );

  return (
    <div className="w-full">
      <Topbar
        title="Media"
        subtitle="Organise uploads into folders. Drag images onto folders to move them. Recycle bin keeps deleted files until purged."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={trashMode ? "secondary" : "ghost"}
              className="h-9 gap-2"
              onClick={() => {
                setTrashMode((t) => !t);
                setCurrentFolderId(null);
              }}
            >
              <Trash2 size={16} aria-hidden />
              {trashMode ? "Back to library" : "Recycle bin"}
            </Button>
            {!trashMode ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 gap-2"
                  onClick={() => setNewFolderOpen(true)}
                >
                  <FolderPlus size={16} aria-hidden />
                  New folder
                </Button>
                {uploadTrigger}
              </>
            ) : null}
          </div>
        }
      />

      <Card className="mb-6 flex flex-col gap-3 border-stone-200/90 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Storage usage (team budget)
            </span>
            <span className="text-xs font-semibold text-stone-700">
              {formatBytes(usage.usedBytes)}{" "}
              <span className="font-normal text-stone-400">/</span> {formatBytes(usage.maxBytes)}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200">
            <div className={`h-full rounded-full transition-all ${usageTone}`} style={{ width: `${usagePct}%` }} />
          </div>
          <p className="mt-2 text-[11px] leading-snug text-stone-500">
            Budget set to <strong>800 MB</strong> so you stay under typical hosted limits. Delete or purge unused assets
            early.
          </p>
        </div>
      </Card>

      {error ? (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {!trashMode ? (
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs font-semibold text-stone-500">
          <button
            type="button"
            className="rounded-md px-2 py-1 hover:bg-stone-100 hover:text-[var(--color-primary)]"
            onClick={() => setCurrentFolderId(null)}
          >
            Library
          </button>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight size={14} className="text-stone-300" aria-hidden />
              <button
                type="button"
                className={`rounded-md px-2 py-1 hover:bg-stone-100 ${
                  crumb.id === currentFolderId ? "text-[var(--color-primary)]" : ""
                }`}
                onClick={() => setCurrentFolderId(crumb.id)}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </nav>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <DroppableRootZone disabled={trashMode}>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-stone-400">
              <Loader2 className="animate-spin" size={32} aria-hidden />
              <p className="text-sm font-medium">Loading…</p>
            </div>
          ) : trashMode ? (
            items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white py-24">
                <Trash2 size={36} className="mb-4 text-stone-300" aria-hidden />
                <p className="text-sm font-semibold text-stone-700">Recycle bin is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((item) => (
                  <Card key={item.id} className="relative bg-white p-2 shadow-sm">
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-stone-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt="" className="h-full w-full object-cover opacity-70" />
                    </div>
                    <p className="truncate px-1 text-xs font-bold text-stone-700">{item.filename}</p>
                    <div className="mt-3 flex flex-wrap gap-2 px-1">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-8 flex-1 text-[11px]"
                        onClick={async () => {
                          try {
                            await restoreMedia(item.id, null);
                            await reload();
                          } catch (e: unknown) {
                            setError(e instanceof Error ? e.message : "Restore failed.");
                          }
                        }}
                      >
                        <RotateCcw size={14} className="mr-1" aria-hidden />
                        Restore
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-8 flex-1 text-[11px]"
                        onClick={() => setConfirmPurgeFile(item)}
                      >
                        <Eraser size={14} className="mr-1" aria-hidden />
                        Purge
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <>
              {childFolders.length > 0 ? (
                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                  {childFolders.map((folder) => (
                    <DroppableFolderShell
                      key={folder.id}
                      folderId={folder.id}
                      folderName={folder.name}
                      disabled={trashMode}
                      onOpen={() => setCurrentFolderId(folder.id)}
                      onFolderContextMenu={(e) => openCtxFolder(e, folder)}
                    />
                  ))}
                </div>
              ) : null}

              {items.length === 0 && childFolders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white py-24">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-stone-300">
                    <ImageIcon size={32} aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">This folder is empty</h3>
                  <p className="mt-1 max-w-sm text-center text-sm text-stone-500">
                    Upload images or create folders. Drag files onto folder tiles to organise them.
                  </p>
                  <div className="mt-6 flex gap-3">{uploadTrigger}</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {items.map((item) => (
                    <DraggableFileCard
                      key={item.id}
                      item={item}
                      trashMode={trashMode}
                      copiedId={copiedId}
                      onCopy={() => {
                        void navigator.clipboard.writeText(item.url);
                        setCopiedId(item.id);
                        window.setTimeout(() => setCopiedId(null), 2000);
                      }}
                      onCtx={openCtxFile}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </DroppableRootZone>
      </DndContext>

      {ctxMenu ? (
        <div
          ref={ctxMenuRef}
          className="fixed z-[400] min-w-[200px] overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-xl"
          style={{
            left: Math.min(ctxMenu.x, typeof window !== "undefined" ? window.innerWidth - 220 : ctxMenu.x),
            top: Math.min(ctxMenu.y, typeof window !== "undefined" ? window.innerHeight - 240 : ctxMenu.y),
          }}
          role="menu"
        >
          {ctxMenu.kind === "folder" ? (
            <>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-stone-50"
                onClick={() => {
                  const f = ctxMenu.target as MediaFolderRow;
                  setCurrentFolderId(f.id);
                  setCtxMenu(null);
                }}
              >
                <FolderIcon size={16} aria-hidden /> Open
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-stone-50"
                onClick={() => {
                  const f = ctxMenu.target as MediaFolderRow;
                  renameKindRef.current = "folder";
                  renameIdRef.current = f.id;
                  setRenameValue(f.name);
                  setRenameOpen(true);
                  setCtxMenu(null);
                }}
              >
                <Pencil size={16} aria-hidden /> Rename
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
                onClick={() => {
                  setConfirmDeleteFolder(ctxMenu.target as MediaFolderRow);
                  setCtxMenu(null);
                }}
              >
                <Trash2 size={16} aria-hidden /> Delete folder
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-stone-50"
                onClick={() => {
                  const f = ctxMenu.target as MediaRow;
                  void navigator.clipboard.writeText(f.url);
                  setCopiedId(f.id);
                  window.setTimeout(() => setCopiedId(null), 2000);
                  setCtxMenu(null);
                }}
              >
                <Copy size={16} aria-hidden /> Copy URL
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-stone-50"
                onClick={() => {
                  const f = ctxMenu.target as MediaRow;
                  renameKindRef.current = "file";
                  renameIdRef.current = f.id;
                  setRenameValue(f.filename);
                  setRenameOpen(true);
                  setCtxMenu(null);
                }}
              >
                <Pencil size={16} aria-hidden /> Rename
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
                onClick={() => {
                  setConfirmTrashFile(ctxMenu.target as MediaRow);
                  setCtxMenu(null);
                }}
              >
                <Trash2 size={16} aria-hidden /> Move to recycle bin
              </button>
            </>
          )}
        </div>
      ) : null}

      <Modal isOpen={renameOpen} onClose={() => setRenameOpen(false)} title="Rename">
        <div className="space-y-4">
          <input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />
          <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
            <Button variant="secondary" type="button" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitRename()}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={newFolderOpen} onClose={() => setNewFolderOpen(false)} title="New folder">
        <div className="space-y-4">
          <input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
          />
          <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
            <Button variant="secondary" type="button" onClick={() => setNewFolderOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitNewFolder()}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(confirmTrashFile)}
        onClose={() => setConfirmTrashFile(null)}
        onConfirm={async () => {
          if (!confirmTrashFile) return;
          try {
            await softDeleteMedia(confirmTrashFile.id);
            setConfirmTrashFile(null);
            await reload();
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Could not delete file.");
          }
        }}
        title="Move to recycle bin?"
        description="This file will be hidden from the library until you restore or permanently purge it."
        confirmLabel="Move to bin"
      />

      <ConfirmDialog
        isOpen={Boolean(confirmPurgeFile)}
        onClose={() => setConfirmPurgeFile(null)}
        onConfirm={async () => {
          if (!confirmPurgeFile) return;
          try {
            await purgeMedia(confirmPurgeFile.id);
            setConfirmPurgeFile(null);
            await reload();
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Could not purge file.");
          }
        }}
        title="Delete permanently?"
        description="This removes the file from storage and cannot be undone."
        confirmLabel="Delete permanently"
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteFolder)}
        onClose={() => setConfirmDeleteFolder(null)}
        onConfirm={async () => {
          if (!confirmDeleteFolder) return;
          try {
            await deleteMediaFolder(confirmDeleteFolder.id);
            setConfirmDeleteFolder(null);
            if (currentFolderId === confirmDeleteFolder.id) setCurrentFolderId(null);
            await reload();
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Could not delete folder.");
          }
        }}
        title="Delete folder?"
        description="The folder must be empty (no files, no subfolders). This cannot be undone."
        confirmLabel="Delete folder"
      />
    </div>
  );
}
