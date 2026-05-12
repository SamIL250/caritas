"use client";

import React, { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MediaPicker } from "@/components/dashboard/MediaPicker";
import {
  type PublicationFieldDef,
} from "@/lib/publications";

type Props = {
  fields: PublicationFieldDef[];
  initialValues: Record<string, unknown>;
};

export function PublicationCustomFields({ fields, initialValues }: Props) {
  if (!fields.length) return null;

  return (
    <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-6">
      <header>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Category-specific fields
        </h3>
        <p className="mt-1 text-xs text-stone-500">
          These inputs are defined on the category and stored on the publication.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <DynamicFieldInput key={f.key} field={f} initialValue={initialValues[f.key]} />
        ))}
      </div>
    </section>
  );
}

function DynamicFieldInput({
  field,
  initialValue,
}: {
  field: PublicationFieldDef;
  initialValue: unknown;
}) {
  const id = useId();
  const name = `custom__${field.key}`;
  const wrapperClass = field.type === "textarea" || field.type === "media" ? "sm:col-span-2" : "";

  return (
    <div className={`space-y-1 ${wrapperClass}`}>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500" htmlFor={id}>
        {field.label}
        {field.required ? <span className="ml-1 text-[#7A1515]">*</span> : null}
      </label>
      <DynamicFieldControl id={id} name={name} field={field} initialValue={initialValue} />
      {field.helper ? <p className="text-[11px] text-stone-400">{field.helper}</p> : null}
    </div>
  );
}

function DynamicFieldControl({
  id,
  name,
  field,
  initialValue,
}: {
  id: string;
  name: string;
  field: PublicationFieldDef;
  initialValue: unknown;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        id={id}
        name={name}
        rows={4}
        defaultValue={typeof initialValue === "string" ? initialValue : ""}
        required={field.required}
        placeholder={field.placeholder}
        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        id={id}
        name={name}
        defaultValue={typeof initialValue === "string" ? initialValue : ""}
        required={field.required}
        className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
      >
        <option value="">Select…</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={initialValue === true}
          className="size-4 rounded border-stone-300 accent-[#7A1515]"
        />
        Enabled
      </label>
    );
  }

  if (field.type === "color") {
    const initial = typeof initialValue === "string" && /^#[0-9a-fA-F]{6}$/.test(initialValue)
      ? initialValue
      : "#7A1515";
    return (
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          name={name}
          defaultValue={initial}
          className="h-9 w-12 cursor-pointer rounded-md border border-stone-200 bg-white p-1"
        />
      </div>
    );
  }

  if (field.type === "media") {
    return <MediaInput id={id} name={name} initialValue={initialValue} placeholder={field.placeholder} />;
  }

  if (field.type === "number") {
    return (
      <Input
        id={id}
        name={name}
        type="number"
        defaultValue={
          typeof initialValue === "number"
            ? initialValue
            : typeof initialValue === "string" && initialValue.trim() !== ""
              ? initialValue
              : ""
        }
        required={field.required}
        placeholder={field.placeholder}
      />
    );
  }

  const inputType =
    field.type === "url"
      ? "url"
      : field.type === "date"
        ? "date"
        : field.type === "datetime"
          ? "datetime-local"
          : "text";

  return (
    <Input
      id={id}
      name={name}
      type={inputType}
      defaultValue={typeof initialValue === "string" ? initialValue : ""}
      required={field.required}
      placeholder={field.placeholder}
    />
  );
}

function MediaInput({
  id,
  name,
  initialValue,
  placeholder,
}: {
  id: string;
  name: string;
  initialValue: unknown;
  placeholder?: string;
}) {
  const initial = typeof initialValue === "string" ? initialValue : "";
  const [url, setUrl] = useState(initial);
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <input id={id} type="hidden" name={name} value={url} readOnly />
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-h-[44px] flex-1 items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600">
          {url ? <span className="truncate font-mono">{url}</span> : <span className="text-stone-400">{placeholder || "No file selected"}</span>}
        </div>
        <Button type="button" variant="secondary" className="h-9" onClick={() => setOpen(true)}>
          Choose file
        </Button>
        {url ? (
          <Button type="button" variant="secondary" className="h-9" onClick={() => setUrl("")}>
            Clear
          </Button>
        ) : null}
      </div>
      <MediaPicker
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={(m) => {
          const next = Array.isArray(m) ? m[0]?.url : m.url;
          if (next) setUrl(next);
          setOpen(false);
        }}
      />
    </div>
  );
}
