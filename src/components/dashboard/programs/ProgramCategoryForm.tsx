"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { MediaPicker } from "@/components/dashboard/MediaPicker";
import {
  encodeProgramAssetUrl,
  slugifyCategorySlug,
  type ProgramCategoryRow,
} from "@/lib/programs";
import {
  createProgramCategory,
  updateProgramCategory,
} from "@/app/actions/program-categories";
import { ProgramCategoryIcon } from "./ProgramCategoryIcon";

const BACK_HREF = "/dashboard/programs?tab=settings";

type Props =
  | { mode: "create"; category?: undefined }
  | { mode: "edit"; category: ProgramCategoryRow };

function ProgramCategoryForm(props: Props) {
  const router = useRouter();
  const { mode } = props;
  const cat = mode === "edit" ? props.category : undefined;

  const [label, setLabel] = useState(cat?.label ?? "");
  const [pluralLabel, setPluralLabel] = useState(cat?.plural_label ?? "");
  const [slug, setSlug] = useState(cat?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(cat?.description ?? "");
  const [icon, setIcon] = useState(cat?.icon ?? "fa-solid fa-folder");
  const [accent, setAccent] = useState(cat?.accent ?? "#7A1515");
  const [coverUrl, setCoverUrl] = useState(cat?.cover_image_url ?? "");
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(cat?.sort_order ?? 100);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const formId = useId();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    fd.set("cover_image_url", coverUrl.trim());
    const r =
      mode === "create"
        ? await createProgramCategory(fd)
        : await updateProgramCategory(cat!.id, fd);
    setBusy(false);
    if (r.error) {
      setMsg({ ok: false, text: r.error });
      return;
    }
    router.push(BACK_HREF);
    router.refresh();
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
            {mode === "create" ? "New program category" : "Edit program category"}
          </h2>
          {mode === "edit" && cat ? (
            <p className="mt-0.5 inline-flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500">
              <ProgramCategoryIcon icon={cat.icon} accent={cat.accent} size={20} />
              {cat.label}
              {cat.is_system ? (
                <>
                  <span className="text-stone-300">·</span>
                  Built-in
                </>
              ) : null}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-stone-500">
              Categories appear as tabs on Programs and as anchors on the public page.
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
      <input type="hidden" name="icon" value={icon} readOnly />

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
                if (!slugTouched) setSlug(slugifyCategorySlug(v));
              }}
              placeholder="e.g. Emergency Response"
            />
          </Field>
          <Field label="Plural label (optional)" htmlFor={`${formId}-plural`}>
            <Input
              id={`${formId}-plural`}
              name="plural_label"
              value={pluralLabel}
              onChange={(e) => setPluralLabel(e.target.value)}
              placeholder="e.g. Emergency Response"
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
              placeholder="emergency-response"
            />
            <p className="text-[11px] text-stone-400">
              Lowercase letters, numbers and hyphens.{" "}
              {isSystem ? "Built-in slug locked." : "Used in URLs and the /programs anchor."}
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
              placeholder="Short context shown on the dashboard and the /programs section header."
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
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="fa-solid fa-folder"
            />
            <p className="text-[11px] text-stone-400">
              e.g. <code>fa-solid fa-people-roof</code>, <code>fa-solid fa-heart-pulse</code>,{" "}
              <code>fa-solid fa-seedling</code>
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
        <header>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Cover image (optional)
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            Used as a banner image for the section if you ever need a fallback when no programs are
            featured yet.
          </p>
        </header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative aspect-[16/10] w-full max-w-[260px] shrink-0 overflow-hidden rounded-xl bg-stone-100">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={encodeProgramAssetUrl(coverUrl)} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full min-h-[140px] flex-col items-center justify-center gap-1 text-center text-[11px] text-stone-400">
                <ImagePlus className="size-9 stroke-1 text-stone-300" aria-hidden />
                No cover
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-9"
              onClick={() => setCoverPickerOpen(true)}
            >
              Choose from library
            </Button>
            {coverUrl ? (
              <Button
                type="button"
                variant="secondary"
                className="h-9 text-stone-500"
                onClick={() => setCoverUrl("")}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <MediaPicker
        isOpen={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onSelect={(m) => {
          const url = Array.isArray(m) ? m[0]?.url : m.url;
          if (url) setCoverUrl(url);
          setCoverPickerOpen(false);
        }}
      />

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

export default ProgramCategoryForm;

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
