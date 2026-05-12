"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import type { Database } from "@/types/database.types";

type CategoryRow = Database["public"]["Tables"]["community_campaign_categories"]["Row"];

export function CommunityCampaignCategoriesPanel({ initial }: { initial: CategoryRow[] }) {
  const supabase = createClient();
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<CategoryRow | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from("community_campaign_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    setCategories(data ?? []);
  }, [supabase]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const n = name.trim();
    const s = slugManual ? slugify(slug) : slugify(n);
    if (!n || !s) {
      setMsg("Enter a category name.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("community_campaign_categories").insert({
      name: n,
      slug: s,
      sort_order: categories.length * 10 + 10,
    });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setName("");
    setSlug("");
    setSlugManual(false);
    await reload();
  }

  function openEdit(c: CategoryRow) {
    setEditRow({ ...c });
    setEditOpen(true);
    setMsg(null);
  }

  async function saveEdit() {
    if (!editRow) return;
    setMsg(null);
    setBusy(true);
    const n = editRow.name.trim();
    const s = slugify((editRow.slug || "").trim() || n);
    if (!n || !s) {
      setBusy(false);
      setMsg("Name and slug are required.");
      return;
    }
    const { error } = await supabase
      .from("community_campaign_categories")
      .update({
        name: n,
        slug: s,
        sort_order: editRow.sort_order,
      })
      .eq("id", editRow.id);
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setEditOpen(false);
    setEditRow(null);
    await reload();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setMsg(null);
    setBusy(true);
    const { error } = await supabase.from("community_campaign_categories").delete().eq("id", deleteTarget.id);
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setDeleteTarget(null);
    await reload();
  }

  return (
    <div className="space-y-6">
      {msg ? (
        <p role="status" className="text-sm text-red-600">
          {msg}
        </p>
      ) : null}

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <h3 className="text-sm font-bold text-stone-900">New category</h3>
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleAdd}>
          <div className="min-w-[180px] flex-1 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400" htmlFor="nc-name">
              Display name
            </label>
            <Input
              id="nc-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugManual) setSlug(slugify(e.target.value));
              }}
              placeholder="Medical Support"
            />
          </div>
          <div className="min-w-[160px] flex-1 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400" htmlFor="nc-slug">
              Slug (URL-safe)
            </label>
            <Input
              id="nc-slug"
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              placeholder="medical-support"
            />
          </div>
          <Button type="submit" disabled={busy} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Add
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden border-stone-200/90">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3 font-medium text-stone-900">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-600">{c.slug}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      className="inline-flex rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-[var(--color-primary)]"
                      onClick={() => openEdit(c)}
                      aria-label={`Edit ${c.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="inline-flex rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setDeleteTarget(c)}
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit category">
        {editRow ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400" htmlFor="ec-name">
                Display name
              </label>
              <Input
                id="ec-name"
                value={editRow.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setEditRow((r) => (r ? { ...r, name: v } : r));
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400" htmlFor="ec-slug">
                Slug
              </label>
              <Input
                id="ec-slug"
                value={editRow.slug}
                onChange={(e) => setEditRow((r) => (r ? { ...r, slug: e.target.value } : r))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400" htmlFor="ec-sort">
                Sort order
              </label>
              <Input
                id="ec-sort"
                type="number"
                value={editRow.sort_order}
                onChange={(e) =>
                  setEditRow((r) =>
                    r ? { ...r, sort_order: Math.round(Number(e.target.value) || 0) } : r,
                  )
                }
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void saveEdit()} disabled={busy} className="gap-2">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Save changes
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete category?"
        description={`Delete “${deleteTarget?.name ?? ""}”? Campaigns still assigned to this category must be reassigned first (the database will block if any remain).`}
        confirmLabel="Delete"
      />
    </div>
  );
}
