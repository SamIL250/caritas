"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  HEALTH_FACILITY_CATEGORIES,
  HEALTH_FACILITY_COLUMNS,
  HEALTH_FACILITY_COORD_FIELDS,
  hasExactHealthFacilityCoords,
  type HealthFacilityCategory,
  type DioceseHealthFacility,
} from "@/lib/diocese-health-facilities";

const EDITOR_PAGE_SIZE = 20;
type HealthFacilityTextField = (typeof HEALTH_FACILITY_COLUMNS)[number]["key"];

type Props = {
  facilities: DioceseHealthFacility[];
  onChange: (facilities: DioceseHealthFacility[]) => void;
};

export function DioceseHealthFacilitiesEditor({ facilities, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredIndices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return facilities.map((_, i) => i);
    return facilities
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => {
        const haystack = [
          f.diocese,
          f.district,
          f.sector,
          f.name,
          f.facility_type,
          f.category,
          f.responsible,
          f.lat,
          f.lng,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .map(({ i }) => i);
  }, [facilities, search]);

  const exactCoordCount = useMemo(
    () => facilities.filter((f) => hasExactHealthFacilityCoords(f)).length,
    [facilities],
  );

  const totalPages = Math.max(1, Math.ceil(filteredIndices.length / EDITOR_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageIndices = filteredIndices.slice(
    (safePage - 1) * EDITOR_PAGE_SIZE,
    safePage * EDITOR_PAGE_SIZE,
  );

  const patchFacility = (index: number, field: HealthFacilityTextField, value: string) => {
    const list = [...facilities];
    list[index] = { ...list[index], [field]: value };
    onChange(list);
  };

  const patchFacilityCategory = (index: number, category: HealthFacilityCategory) => {
    const list = [...facilities];
    list[index] = { ...list[index], category };
    onChange(list);
  };

  const patchFacilityCoord = (index: number, field: "lat" | "lng", raw: string) => {
    const list = [...facilities];
    const trimmed = raw.trim();
    const next = { ...list[index] };

    if (!trimmed) {
      delete next[field];
    } else {
      const value = Number(trimmed);
      if (!Number.isFinite(value)) return;
      next[field] = value;
    }

    list[index] = next;
    onChange(list);
  };

  const removeFacility = (index: number) => {
    onChange(facilities.filter((_, i) => i !== index));
  };

  const addFacility = () => {
    onChange([
      ...facilities,
      {
        id: `facility-${Date.now()}`,
        category: "health_center",
        diocese: "",
        district: "",
        sector: "",
        name: "",
        facility_type: "",
        responsible: "",
      },
    ]);
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-stone-500 leading-relaxed">
        Set latitude and longitude for exact map placement. Facilities without coordinates use an
        approximate position near their diocese.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          className="flex-1 min-w-[200px] rounded border border-stone-200 p-2 text-xs"
          placeholder="Search facilities…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <span className="text-[10px] text-stone-500 whitespace-nowrap">
          {facilities.length} total · {exactCoordCount} with exact coords
        </span>
      </div>

      <ul className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {pageIndices.map((idx) => {
          const f = facilities[idx];
          const hasExactCoords = hasExactHealthFacilityCoords(f);
          return (
            <li
              key={f.id || idx}
              className="relative list-none rounded-lg border border-stone-100 bg-stone-50 p-3"
            >
              <button
                type="button"
                className="absolute right-2 top-2 text-stone-300 hover:text-red-500"
                onClick={() => removeFacility(idx)}
                aria-label="Remove facility"
              >
                <X size={14} aria-hidden />
              </button>
              <div className="mb-2 pr-8">
                <span
                  className={`inline-flex rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                    hasExactCoords
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {hasExactCoords ? "Exact map location" : "Approximate map location"}
                </span>
              </div>
              <div className="mb-3 pr-8">
                <label className="text-[9px] font-bold uppercase text-stone-400">
                  Facility category
                </label>
                <select
                  className="mt-0.5 w-full rounded border border-stone-200 bg-white p-2 text-xs"
                  value={f.category}
                  onChange={(event) =>
                    patchFacilityCategory(
                      idx,
                      event.target.value as HealthFacilityCategory,
                    )
                  }
                >
                  {HEALTH_FACILITY_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2 pr-8 sm:grid-cols-2">
                {HEALTH_FACILITY_COLUMNS.map((col) => (
                  <div key={col.key} className="space-y-0.5">
                    <label className="text-[9px] font-bold uppercase text-stone-400">
                      {col.label}
                    </label>
                    <input
                      className="w-full rounded border border-stone-200 p-2 text-xs"
                      value={f[col.key] ?? ""}
                      onChange={(e) => patchFacility(idx, col.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 pr-8 sm:grid-cols-2">
                {HEALTH_FACILITY_COORD_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-0.5">
                    <label className="text-[9px] font-bold uppercase text-stone-400">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="w-full rounded border border-stone-200 p-2 text-xs font-mono"
                      value={f[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) => patchFacilityCoord(idx, field.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </li>
          );
        })}
        {filteredIndices.length === 0 ? (
          <li className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200 list-none">
            No facilities match your search.
          </li>
        ) : null}
      </ul>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-xs text-stone-500">
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span>
            Page {safePage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}

      <Button type="button" variant="secondary" className="w-full" onClick={addFacility}>
        <Plus size={14} className="mr-2" aria-hidden /> Add health facility
      </Button>
    </div>
  );
}
