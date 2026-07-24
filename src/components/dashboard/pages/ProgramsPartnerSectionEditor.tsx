"use client";

import React from "react";

type Props = {
  state: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  renderField: (
    label: string,
    key: string,
    fieldType: "text" | "textarea",
    options?: { rows?: number },
  ) => React.ReactNode;
};

export default function ProgramsPartnerSectionEditor({ state, onChange, renderField }: Props) {
  const secondaryAction = state.secondary_action === "contact" ? "contact" : "back_to_top";

  return (
    <div className="space-y-6">
      <p className="text-[10px] leading-relaxed text-stone-500">
        Partner call-to-action at the bottom of the Programs page.
      </p>
      {renderField("Eyebrow", "eyebrow", "text")}
      <label className="block space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Eyebrow icon</span>
        <input
          type="text"
          value={String(state.eyebrow_icon ?? "fa-handshake")}
          onChange={(e) => onChange("eyebrow_icon", e.target.value)}
          placeholder="fa-handshake"
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
        />
      </label>
      {renderField("Title", "title", "textarea", { rows: 3 })}
      <p className="-mt-4 text-[9px] text-stone-400">Use a new line for a line break in the heading.</p>
      {renderField("Subtitle", "subtitle", "textarea", { rows: 4 })}
      {renderField("Primary button label", "primary_label", "text")}
      <label className="block space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Secondary button</span>
        <select
          value={secondaryAction}
          onChange={(e) => onChange("secondary_action", e.target.value)}
          className="h-9 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm"
        >
          <option value="back_to_top">Back to top</option>
          <option value="contact">Contact page</option>
        </select>
      </label>
      {renderField("Secondary button label", "secondary_label", "text")}
      {renderField("Outline button label", "outline_label", "text")}
      {renderField("Outline button URL", "outline_href", "text")}
    </div>
  );
}
