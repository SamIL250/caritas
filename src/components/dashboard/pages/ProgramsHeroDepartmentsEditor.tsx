"use client";

import React from "react";
import type { ProgramCategoryRow } from "@/lib/programs";
import {
  PROGRAMS_HERO_LEFT_COUNT,
  type ProgramsHeroDepartment,
} from "@/lib/programs-hero-departments";

type Props = {
  items: ProgramsHeroDepartment[];
  caption: string;
  categories: ProgramCategoryRow[];
  onChange: (items: ProgramsHeroDepartment[]) => void;
  onCaptionChange: (caption: string) => void;
};

function DepartmentSlot({
  index,
  item,
  categories,
  onPatch,
}: {
  index: number;
  item: ProgramsHeroDepartment;
  categories: ProgramCategoryRow[];
  onPatch: (index: number, patch: Partial<ProgramsHeroDepartment>) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-stone-100 bg-stone-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A1515]">
        Item {index + 1}
      </p>
      <label className="block space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Label
        </span>
        <input
          type="text"
          value={item.label}
          onChange={(e) => onPatch(index, { label: e.target.value })}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Scrolls to department
        </span>
        {categories.length > 0 ? (
          <select
            value={item.slug}
            onChange={(e) => onPatch(index, { slug: e.target.value })}
            className="h-9 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
          >
            {categories.some((category) => category.slug === item.slug) ? null : (
              <option value={item.slug}>{item.slug}</option>
            )}
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={item.slug}
            onChange={(e) => onPatch(index, { slug: e.target.value })}
            placeholder="finance-administration"
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
          />
        )}
      </label>
    </div>
  );
}

export default function ProgramsHeroDepartmentsEditor({
  items,
  caption,
  categories,
  onChange,
  onCaptionChange,
}: Props) {
  function patch(index: number, next: Partial<ProgramsHeroDepartment>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...next } : item)));
  }

  const left = items.slice(0, PROGRAMS_HERO_LEFT_COUNT);
  const right = items.slice(PROGRAMS_HERO_LEFT_COUNT);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Department listings
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-stone-500">
          Two columns of two names. The left column sits against the divider from the right; the right
          column sits against it from the left. Each name scrolls to that department tab.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Left column
          </p>
          {left.map((item, index) => (
            <DepartmentSlot
              key={`left-${index}`}
              index={index}
              item={item}
              categories={categories}
              onPatch={patch}
            />
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Right column
          </p>
          {right.map((item, index) => (
            <DepartmentSlot
              key={`right-${index}`}
              index={index + PROGRAMS_HERO_LEFT_COUNT}
              item={item}
              categories={categories}
              onPatch={patch}
            />
          ))}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Caption under columns
        </span>
        <input
          type="text"
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-[#7A1515] focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20"
        />
      </label>
    </div>
  );
}
