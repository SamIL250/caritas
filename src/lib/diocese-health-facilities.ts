export type DioceseHealthFacility = {
  id: string;
  diocese: string;
  district: string;
  sector: string;
  name: string;
  facility_type: string;
  responsible: string;
  lat?: number;
  lng?: number;
};

export const HEALTH_FACILITY_COLUMNS = [
  { key: "diocese", label: "Diocese" },
  { key: "district", label: "District" },
  { key: "sector", label: "Sector" },
  { key: "name", label: "Health facility" },
  { key: "facility_type", label: "Type of facility" },
  { key: "responsible", label: "Responsible institution" },
] as const;

function normalizeResponsible(value: string): string {
  const trimmed = value.trim();
  if (trimmed.toLowerCase() === "catolic") return "Catholic";
  return trimmed;
}

export function normalizeHealthFacilities(raw: unknown): DioceseHealthFacility[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((row, index) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Partial<DioceseHealthFacility>;
      const name = typeof r.name === "string" ? r.name.trim() : "";
      if (!name) return null;

      const diocese = typeof r.diocese === "string" ? r.diocese.trim() : "";
      const district = typeof r.district === "string" ? r.district.trim() : "";
      const sector = typeof r.sector === "string" ? r.sector.trim() : "";
      const facilityType =
        typeof r.facility_type === "string" ? r.facility_type.trim() : "";
      const responsible = normalizeResponsible(
        typeof r.responsible === "string" ? r.responsible : "",
      );
      const lat = Number.isFinite(Number(r.lat)) ? Number(r.lat) : undefined;
      const lng = Number.isFinite(Number(r.lng)) ? Number(r.lng) : undefined;
      const id =
        typeof r.id === "string" && r.id.trim()
          ? r.id.trim()
          : `facility-${index + 1}`;

      return {
        id,
        diocese,
        district,
        sector,
        name,
        facility_type: facilityType,
        responsible,
        ...(lat !== undefined && lng !== undefined ? { lat, lng } : {}),
      };
    })
    .filter((row): row is DioceseHealthFacility => row !== null);
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
