import type { DioceseMapMarker } from "@/lib/diocese-map-defaults";
import {
  hasExactHealthFacilityCoords,
  type DioceseHealthFacility,
} from "@/lib/diocese-health-facilities";

/** Excel / CMS diocese labels → diocese marker id */
const DIOCESE_ALIASES: Record<string, string> = {
  "archidiocese de kigali": "kigali",
  "archdiocese of kigali": "kigali",
  kigali: "kigali",
  bugesera: "kigali",
  "diocese butare": "butare",
  butare: "butare",
  "diocese cyangungu": "cyangugu",
  cyangugu: "cyangugu",
  cyangungu: "cyangugu",
  "diocese kabgayi": "kabgayi",
  kabgayi: "kabgayi",
  "diocese nyundo": "nyundo",
  nyundo: "nyundo",
  "diocese de byumba": "byumba",
  byumba: "byumba",
  "diocese de gikongoro": "gikongoro",
  gikongoro: "gikongoro",
  "diocese de kibungo": "kibungo",
  kibungo: "kibungo",
  "diocese de ruhengeri": "ruhengeri",
  ruhengeri: "ruhengeri",
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function resolveDioceseId(label: string): string | null {
  const key = label.trim().toLowerCase();
  if (!key) return null;
  const exact = DIOCESE_ALIASES[key];
  if (exact) return exact;

  for (const id of [
    "kigali",
    "kabgayi",
    "butare",
    "byumba",
    "cyangugu",
    "gikongoro",
    "kibungo",
    "nyundo",
    "ruhengeri",
  ]) {
    if (key.includes(id)) return id;
  }
  if (key.includes("cyangungu")) return "cyangugu";
  return null;
}

export type HealthFacilityMapPoint = DioceseHealthFacility & {
  lat: number;
  lng: number;
  exactCoords: boolean;
};

export function resolveHealthFacilityCoordinates(
  facility: DioceseHealthFacility,
  dioceses: DioceseMapMarker[],
  indexInSector: number,
): { lat: number; lng: number } | null {
  if (Number.isFinite(facility.lat) && Number.isFinite(facility.lng)) {
    return { lat: facility.lat!, lng: facility.lng! };
  }

  const dioceseId = resolveDioceseId(facility.diocese);
  if (!dioceseId) return null;

  const anchor = dioceses.find((d) => d.id === dioceseId);
  if (!anchor?.lat || !anchor?.lng) return null;

  const sectorKey = `${facility.district}|${facility.sector}`.toLowerCase();
  const sectorHash = hashString(sectorKey);
  const angle = ((sectorHash % 360) * Math.PI) / 180;
  const ring = 0.08 + (sectorHash % 5) * 0.04;
  const facilityJitter = ((indexInSector % 7) - 3) * 0.006;

  return {
    lat: anchor.lat + Math.sin(angle) * ring + facilityJitter,
    lng: anchor.lng + Math.cos(angle) * ring + facilityJitter * 0.8,
  };
}

export function buildHealthFacilityMapPoints(
  facilities: DioceseHealthFacility[],
  dioceses: DioceseMapMarker[],
): HealthFacilityMapPoint[] {
  const sectorCounts = new Map<string, number>();
  const points: HealthFacilityMapPoint[] = [];

  for (const facility of facilities) {
    const sectorKey = `${facility.diocese}|${facility.district}|${facility.sector}`;
    const indexInSector = sectorCounts.get(sectorKey) ?? 0;
    sectorCounts.set(sectorKey, indexInSector + 1);

    const coords = resolveHealthFacilityCoordinates(facility, dioceses, indexInSector);
    if (!coords) continue;

    points.push({
      ...facility,
      lat: coords.lat,
      lng: coords.lng,
      exactCoords: hasExactHealthFacilityCoords(facility),
    });
  }

  return points;
}

export function healthFacilityMarkerStyle(facility: DioceseHealthFacility): {
  fillColor: string;
  radius: number;
  weight: number;
  dashArray: string | null;
} {
  const type = facility.facility_type.toLowerCase();
  const radius = type.includes("hospital") || type.includes("district") ? 9 : 7;
  const exactCoords = hasExactHealthFacilityCoords(facility);

  let fillColor: string;
  switch (facility.category) {
    case "specialized_hospital":
      fillColor = "#6d28d9";
      break;
    case "district_hospital":
      fillColor = "#a31616";
      break;
    case "health_center":
      fillColor = "#1d6f42";
      break;
    default: {
      const exhaustiveCategory: never = facility.category;
      return exhaustiveCategory;
    }
  }

  return {
    fillColor,
    radius,
    weight: exactCoords ? 2.5 : 1.5,
    dashArray: exactCoords ? null : "4 3",
  };
}
