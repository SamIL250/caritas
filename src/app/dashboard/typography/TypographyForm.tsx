"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, RotateCcw, Check } from "lucide-react";
import { updateTypographySettings } from "@/app/actions/typography-settings";
import {
  MIN_TEXT_PRESETS,
  SCALE_PRESETS,
  TYPOGRAPHY_DEFAULTS,
  type TypographySettings,
} from "@/lib/typography-settings";

/** Browser default root size the preview multiplies against. */
const BASE_PX = 16;

/** Representative sizes pulled from the live stylesheets. */
const PREVIEW_ROWS: { rem: number; label: string; sample: string; weight: number }[] = [
  { rem: 2.6, label: "Section heading", sample: "Serving with Faith, Hope & Love", weight: 800 },
  { rem: 1.35, label: "Sub heading", sample: "Seven Decades of Faith & Service", weight: 700 },
  { rem: 1, label: "Body text", sample: "Caritas Rwanda empowers communities with healthcare, education and humanitarian assistance across Rwanda's dioceses.", weight: 400 },
  { rem: 0.78, label: "Small text", sample: "Published 14 September 2026 · Kigali", weight: 500 },
  { rem: 0.62, label: "Labels & badges", sample: "OUR PROGRAMS", weight: 800 },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1">
      {children}
    </p>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
}: {
  options: { value: number; label: string; hint: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`relative rounded-lg border px-3 py-2.5 text-left transition-colors ${
              active
                ? "border-[#7A1515] bg-[#7A1515]/5 ring-2 ring-[#7A1515]/20"
                : "border-stone-200 bg-white hover:bg-stone-50"
            }`}
          >
            {active && (
              <Check className="absolute right-2 top-2 h-3 w-3 text-[#7A1515]" strokeWidth={3} />
            )}
            <span className="block text-sm font-bold text-stone-800">{o.label}</span>
            <span className="block text-[10px] text-stone-500 mt-0.5">{o.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TypographyForm({ initial }: { initial: TypographySettings }) {
  const [scale, setScale] = useState(initial.scale);
  const [minTextRem, setMinTextRem] = useState(initial.minTextRem);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const dirty = scale !== initial.scale || minTextRem !== initial.minTextRem;

  const previewRows = useMemo(
    () =>
      PREVIEW_ROWS.map((row) => {
        const effectiveRem = Math.max(row.rem, minTextRem);
        return {
          ...row,
          px: effectiveRem * BASE_PX * scale,
          lifted: effectiveRem > row.rem,
        };
      }),
    [scale, minTextRem],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateTypographySettings({ scale, minTextRem });
    setSaving(false);
    if (result.success) {
      setMessage({ type: "ok", text: "Saved. The public site now uses these sizes." });
    } else {
      setMessage({ type: "err", text: result.error ?? "Save failed." });
    }
  }, [scale, minTextRem]);

  const handleReset = useCallback(() => {
    setScale(TYPOGRAPHY_DEFAULTS.scale);
    setMinTextRem(TYPOGRAPHY_DEFAULTS.minTextRem);
    setMessage(null);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-stone-800">Overall text size</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Scales every text size on the public website together, so headings, body copy and
            labels keep their proportions.
          </p>
        </div>
        <OptionGrid options={SCALE_PRESETS} value={scale} onChange={setScale} />

        <div className="border-t border-stone-100 pt-5">
          <h3 className="text-sm font-bold text-stone-800">Minimum size for small text</h3>
          <p className="text-xs text-stone-500 mt-0.5 mb-3">
            Raises only the text that falls below this size — captions, dates, tags and badges.
            Anything already larger is left exactly as designed.
          </p>
          <OptionGrid options={MIN_TEXT_PRESETS} value={minTextRem} onChange={setMinTextRem} />
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-stone-800">Preview</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              How these settings render on the public site.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Base {Math.round(BASE_PX * scale * 10) / 10}px
          </span>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50/60 divide-y divide-stone-200/70">
          {previewRows.map((row) => (
            <div key={row.label} className="flex items-start gap-4 p-4">
              <div className="w-28 shrink-0 pt-1">
                <Label>{row.label}</Label>
                <span className="text-[10px] tabular-nums text-stone-400">
                  {Math.round(row.px * 10) / 10}px
                </span>
                {row.lifted && (
                  <span className="ml-1 text-[10px] font-bold text-[#7A1515]">lifted</span>
                )}
              </div>
              <p
                className="min-w-0 flex-1 text-stone-800 leading-snug break-words"
                style={{ fontSize: `${row.px}px`, fontWeight: row.weight }}
              >
                {row.sample}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || !dirty}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button variant="secondary" onClick={handleReset} disabled={saving}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to default
        </Button>
        {message && (
          <span
            className={`text-xs font-semibold ${
              message.type === "ok" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
