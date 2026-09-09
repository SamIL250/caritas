export const HEALTH_FACILITY_CATEGORIES = [
  {
    value: "specialized_hospital",
    label: "Specialized Hospitals",
    singularLabel: "Specialized Hospital",
  },
  {
    value: "district_hospital",
    label: "District Hospitals",
    singularLabel: "District Hospital",
  },
  {
    value: "health_center",
    label: "Health Centers",
    singularLabel: "Health Center",
  },
] as const;

export type HealthFacilityCategory =
  (typeof HEALTH_FACILITY_CATEGORIES)[number]["value"];

export type DioceseHealthFacility = {
  id: string;
  category: HealthFacilityCategory;
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

export const HEALTH_FACILITY_COORD_FIELDS = [
  { key: "lat", label: "Latitude", placeholder: "e.g. -1.9441" },
  { key: "lng", label: "Longitude", placeholder: "e.g. 30.0619" },
] as const;

function parseCoord(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeResponsible(value: string): string {
  const trimmed = value.trim();
  if (trimmed.toLowerCase() === "catolic") return "Catholic";
  return trimmed;
}

export function inferHealthFacilityCategory(
  facilityType: string,
): HealthFacilityCategory {
  const normalized = facilityType.trim().toLowerCase();
  if (
    normalized.includes("specialized") ||
    normalized.includes("teaching") ||
    normalized.includes("eye unit")
  ) {
    return "specialized_hospital";
  }
  if (
    normalized.includes("district hospital") ||
    normalized === "hospital" ||
    normalized.includes("orthopedic centre")
  ) {
    return "district_hospital";
  }
  return "health_center";
}

export function isHealthFacilityCategory(
  value: unknown,
): value is HealthFacilityCategory {
  return HEALTH_FACILITY_CATEGORIES.some((category) => category.value === value);
}

export function healthFacilityCategoryLabel(
  category: HealthFacilityCategory,
  singular = false,
): string {
  const match = HEALTH_FACILITY_CATEGORIES.find((item) => item.value === category);
  if (!match) return "Health Center";
  return singular ? match.singularLabel : match.label;
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
      const category = isHealthFacilityCategory(r.category)
        ? r.category
        : inferHealthFacilityCategory(facilityType);
      const responsible = normalizeResponsible(
        typeof r.responsible === "string" ? r.responsible : "",
      );
      const lat = parseCoord(r.lat);
      const lng = parseCoord(r.lng);
      const id =
        typeof r.id === "string" && r.id.trim()
          ? r.id.trim()
          : `facility-${index + 1}`;

      return {
        id,
        category,
        diocese,
        district,
        sector,
        name,
        facility_type: facilityType,
        responsible,
        ...(lat !== undefined ? { lat } : {}),
        ...(lng !== undefined ? { lng } : {}),
      };
    })
    .filter((row): row is DioceseHealthFacility => row !== null);
}

export function hasExactHealthFacilityCoords(facility: DioceseHealthFacility): boolean {
  return Number.isFinite(facility.lat) && Number.isFinite(facility.lng);
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
