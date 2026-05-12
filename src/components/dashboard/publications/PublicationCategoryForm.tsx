"use client";

import React, { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  PUBLICATION_CATEGORY_KINDS,
  PUBLICATION_FIELD_TYPES,
  publicationKindLabel,
  readCategoryBehavior,
  readFieldSchema,
  type PublicationCategoryKind,
  type PublicationCategoryRow,
  type PublicationFieldDef,
  type PublicationFieldType,
} from "@/lib/publications";
import {
  createPublicationCategory,
  updatePublicationCategory,
} from "@/app/actions/publication-categories";
import { PublicationCategoryIcon } from "./PublicationCategoryIcon";

const BACK_HREF = "/dashboard/publications?tab=settings";

type Props =
  | { mode: "create"; category?: undefined }
  | { mode: "edit"; category: PublicationCategoryRow };

export function PublicationCategoryForm(props: Props) {
  const router = useRouter();
  const { mode } = props;
  const cat = mode === "edit" ? props.category : undefined;
  const initialBehavior = cat ? readCategoryBehavior(cat) : {};
  const initialSchema = cat ? readFieldSchema(cat) : [];

  const [label, setLabel] = useState(cat?.label ?? "");
  const [pluralLabel, setPluralLabel] = useState(cat?.plural_label ?? "");
  const [slug, setSlug] = useState(cat?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(cat?.description ?? "");
  const [icon, setIcon] = useState(cat?.icon ?? "fa-solid fa-file-lines");
  const [accent, setAccent] = useState(cat?.accent ?? "#7A1515");
  const [kind, setKind] = useState<PublicationCategoryKind>(cat?.kind ?? "pdf");
  const [sortOrder, setSortOrder] = useState<number>(cat?.sort_order ?? 100);
  const [siteAnchor, setSiteAnchor] = useState(initialBehavior.site_anchor ?? "");
  const [singleFeatured, setSingleFeatured] = useState(Boolean(initialBehavior.single_featured));
  const [newsLike, setNewsLike] = useState(Boolean(initialBehavior.news_like));
  const [fields, setFields] = useState<PublicationFieldDef[]>(initialSchema);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const formId = useId();

  const fieldsJson = useMemo(() => JSON.stringify(fields, null, 2), [fields]);

  function nextSlugFromLabel(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_\s-]/g, "")
      .replace(/[\s-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 48);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    fd.set("field_schema_json", JSON.stringify(fields));
    const r =
      mode === "create"
        ? await createPublicationCategory(fd)
        : await updatePublicationCategory(cat!.id, fd);
    setBusy(false);
    if (r.error) {
      setMsg({ ok: false, text: r.error });
      return;
    }
    router.push(BACK_HREF);
    router.refresh();
  }

  function patchField(idx: number, patch: Partial<PublicationFieldDef>) {
    setFields((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      { key: "", label: "", type: "text" as PublicationFieldType },
    ]);
  }

  function removeField(idx: number) {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  }

  function patchOption(fieldIdx: number, optIdx: number, patch: { value?: string; label?: string }) {
    setFields((prev) => {
      const next = [...prev];
      const f = next[fieldIdx];
      const opts = [...(f.options ?? [])];
      opts[optIdx] = { ...opts[optIdx], ...patch };
      next[fieldIdx] = { ...f, options: opts };
      return next;
    });
  }

  function addOption(fieldIdx: number) {
    setFields((prev) => {
      const next = [...prev];
      const f = next[fieldIdx];
      const opts = [...(f.options ?? []), { value: "", label: "" }];
      next[fieldIdx] = { ...f, options: opts };
      return next;
    });
  }

  function removeOption(fieldIdx: number, optIdx: number) {
    setFields((prev) => {
      const next = [...prev];
      const f = next[fieldIdx];
      const opts = (f.options ?? []).filter((_, i) => i !== optIdx);
      next[fieldIdx] = { ...f, options: opts.length ? opts : undefined };
      return next;
    });
  }

  const isSystem = mode === "edit" && cat?.is_system;

  return (
    <form className="max-w-3xl space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-3">
        <Link
          href={BACK_HREF}
          className="inline-flex rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        >
          <ArrowLeft size={18} aria-hidden />
        </Link>
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            {mode === "create" ? "New category" : "Edit category"}
          </h2>
          {mode === "edit" && cat ? (
            <p className="mt-0.5 inline-flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500">
              <PublicationCategoryIcon icon={cat.icon} accent={cat.accent} size={20} />
              {cat.label}
              <span className="text-stone-300">·</span>
              {publicationKindLabel(cat.kind)}
              {cat.is_system ? (
                <>
                  <span className="text-stone-300">·</span>
                  Built-in
                </>
              ) : null}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-stone-500">
              Categories appear as tabs on Publications and shape the author form for each type.
            </p>
          )}
        </div>
      </div>

      {msg ? (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </p>
      ) : null}

      <input type="hidden" name="accent" value={accent} readOnly />

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Identity</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Display name" htmlFor={`${formId}-label`}>
            <Input
              id={`${formId}-label`}
              name="label"
              required
              value={label}
              onChange={(e) => {
                const v = e.target.value;
                setLabel(v);
                if (!slugTouched) setSlug(nextSlugFromLabel(v));
              }}
              placeholder="Case study"
            />
          </Field>
          <Field label="Plural label" htmlFor={`${formId}-plural`}>
            <Input
              id={`${formId}-plural`}
              name="plural_label"
              value={pluralLabel}
              onChange={(e) => setPluralLabel(e.target.value)}
              placeholder="Case studies"
            />
          </Field>

          <Field label="Slug" htmlFor={`${formId}-slug`}>
            <Input
              id={`${formId}-slug`}
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              disabled={isSystem}
              placeholder="case_study"
            />
            <p className="text-[11px] text-stone-400">
              Lowercase letters, numbers and underscores.{" "}
              {isSystem ? "Built-in slug locked." : "Used in URLs and filters."}
            </p>
          </Field>
          <Field label="Sort order" htmlFor={`${formId}-sort`}>
            <Input
              id={`${formId}-sort`}
              name="sort_order"
              type="number"
              value={Number.isFinite(sortOrder) ? sortOrder : 100}
              onChange={(e) => setSortOrder(Math.round(Number(e.target.value) || 0))}
            />
          </Field>

          <Field label="Description" htmlFor={`${formId}-desc`} span={2}>
            <textarea
              id={`${formId}-desc`}
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
              placeholder="Short guidance shown to editors in the Categories tab."
            />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Appearance</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Icon (FontAwesome)" htmlFor={`${formId}-icon`} span={2}>
            <Input
              id={`${formId}-icon`}
              name="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="fa-solid fa-file-lines"
            />
            <p className="text-[11px] text-stone-400">
              e.g. <code>fa-solid fa-newspaper</code>, <code>fa-solid fa-book</code>
            </p>
          </Field>
          <Field label="Accent colour" htmlFor={`${formId}-accent-picker`}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id={`${formId}-accent-picker`}
                value={/^#[0-9a-fA-F]{6}$/.test(accent) ? accent : "#7A1515"}
                onChange={(e) => setAccent(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-stone-200 bg-white p-1"
                aria-label="Pick accent colour"
              />
              <Input
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                placeholder="#7A1515"
                className="font-mono text-xs"
              />
            </div>
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Layout & site</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Layout kind" htmlFor={`${formId}-kind`}>
            <select
              id={`${formId}-kind`}
              name="kind"
              value={kind}
              disabled={isSystem}
              onChange={(e) => setKind(e.target.value as PublicationCategoryKind)}
              className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
            >
              {PUBLICATION_CATEGORY_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-stone-400">
              {PUBLICATION_CATEGORY_KINDS.find((k) => k.value === kind)?.help}
              {isSystem ? " · Locked for built-in categories." : ""}
            </p>
          </Field>
          <Field label="Site anchor (optional)" htmlFor={`${formId}-anchor`}>
            <Input
              id={`${formId}-anchor`}
              name="behavior_site_anchor"
              value={siteAnchor}
              onChange={(e) => setSiteAnchor(e.target.value)}
              placeholder="case-studies"
            />
            <p className="text-[11px] text-stone-400">Anchor on /publications (no `#`).</p>
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-3 text-sm text-stone-700 sm:col-span-2">
            <input
              type="checkbox"
              name="behavior_single_featured"
              checked={singleFeatured}
              onChange={(e) => setSingleFeatured(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-stone-300 accent-[#7A1515]"
            />
            <span>
              <span className="font-medium">Single featured slot</span>
              <span className="mt-0.5 block text-xs text-stone-500">
                Only one publication can be featured; it renders as the large hero on /publications.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-3 text-sm text-stone-700 sm:col-span-2">
            <input
              type="checkbox"
              name="behavior_news_like"
              checked={newsLike}
              onChange={(e) => setNewsLike(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-stone-300 accent-[#7A1515]"
            />
            <span>
              <span className="font-medium">News-style rows in dashboard</span>
              <span className="mt-0.5 block text-xs text-stone-500">
                Use the richer card layout (cover thumbnail, badges) in the Publications list.
              </span>
            </span>
          </label>
        </div>
      </Card>

      <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Custom fields</h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-500">
              Extra inputs on each publication of this category. Stored in{" "}
              <code className="font-mono text-[11px]">custom_fields</code>.
            </p>
          </div>
          <Button type="button" variant="secondary" className="h-9 gap-1.5" onClick={addField}>
            <Plus className="size-4" aria-hidden /> Add field
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 px-4 py-10 text-center text-sm text-stone-500">
            No custom fields yet — editors only see the standard fields for this layout kind.
          </p>
        ) : (
          <div className="space-y-4">
            {fields.map((f, i) => (
              <div
                key={i}
                className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/40 p-4 sm:p-5"
              >
                <div className="grid gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase text-stone-400">Key</label>
                    <Input
                      value={f.key}
                      onChange={(e) => patchField(i, { key: nextSlugFromLabel(e.target.value) })}
                      placeholder="region"
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-bold uppercase text-stone-400">Label</label>
                    <Input
                      value={f.label}
                      onChange={(e) => patchField(i, { label: e.target.value })}
                      placeholder="Region"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase text-stone-400">Type</label>
                    <select
                      value={f.type}
                      onChange={(e) => patchField(i, { type: e.target.value as PublicationFieldType })}
                      className="h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-xs"
                    >
                      {PUBLICATION_FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end justify-end gap-1 sm:col-span-2">
                    <label className="mr-auto inline-flex items-center gap-1.5 text-xs text-stone-600">
                      <input
                        type="checkbox"
                        checked={Boolean(f.required)}
                        onChange={(e) => patchField(i, { required: e.target.checked })}
                        className="size-4 rounded border-stone-300 accent-[#7A1515]"
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      onClick={() => removeField(i)}
                      className="inline-flex rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove field"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-400">Placeholder</label>
                    <Input
                      value={f.placeholder ?? ""}
                      onChange={(e) => patchField(i, { placeholder: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-400">Helper text</label>
                    <Input
                      value={f.helper ?? ""}
                      onChange={(e) => patchField(i, { helper: e.target.value })}
                    />
                  </div>
                </div>

                {f.type === "select" ? (
                  <div className="rounded-xl border border-stone-200 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase text-stone-500">
                      Options
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#7A1515] hover:underline"
                        onClick={() => addOption(i)}
                      >
                        + Add option
                      </button>
                    </div>
                    {(f.options ?? []).length === 0 ? (
                      <p className="text-xs text-stone-400">Add at least one option value.</p>
                    ) : (
                      <div className="space-y-2">
                        {(f.options ?? []).map((opt, oi) => (
                          <div key={oi} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                            <Input
                              value={opt.value}
                              onChange={(e) => patchOption(i, oi, { value: e.target.value })}
                              placeholder="value"
                              className="font-mono text-xs sm:flex-1"
                            />
                            <Input
                              value={opt.label}
                              onChange={(e) => patchOption(i, oi, { label: e.target.value })}
                              placeholder="Label"
                              className="sm:flex-1"
                            />
                            <button
                              type="button"
                              className="rounded-lg p-2 text-stone-400 hover:text-red-600"
                              onClick={() => removeOption(i, oi)}
                              aria-label="Remove option"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <details className="rounded-lg border border-stone-100 bg-stone-50/50 p-3 text-xs text-stone-500">
          <summary className="cursor-pointer select-none font-medium text-stone-600">
            Inspect field schema JSON
          </summary>
          <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-stone-900/95 p-3 font-mono text-[11px] text-stone-100">
            {fieldsJson}
          </pre>
        </details>
      </Card>

      <div className="sticky bottom-2 flex justify-end gap-3 rounded-xl border border-stone-200/80 bg-white/95 p-3 backdrop-blur">
        <Link
          href={BACK_HREF}
          className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border-default)] bg-white px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-stone-50"
        >
          Cancel
        </Link>
        <Button type="submit" variant="primary" disabled={busy} className="gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {mode === "create" ? "Create category" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export default PublicationCategoryForm;

function Field({
  label,
  htmlFor,
  children,
  span,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  span?: 1 | 2;
}) {
  return (
    <div className={`space-y-1 ${span === 2 ? "sm:col-span-2" : ""}`}>
      <label
        className="text-[11px] font-semibold uppercase tracking-wider text-stone-500"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
