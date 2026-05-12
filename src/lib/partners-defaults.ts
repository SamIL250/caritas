/** Partner logos — kept outside `"use client"` so server modules (e.g. constants) can import safely. */

export type Partner = {
  name: string;
  logo_url: string;
  /** Optional; omit or empty for a non-linked card */
  url?: string;
};

/** Exclude retired / unwanted partner rows (CMS JSON may still contain legacy entries). */
export function filterPartnersForDisplay(partners: Partner[]): Partner[] {
  return partners.filter((p) => !/^usaid$/i.test(String(p.name || "").trim()));
}

export const DEFAULT_PARTNERS: Partner[] = [
  {
    name: "Secours Catholique France",
    logo_url:
      "https://caritasrwanda.org/wp-content/uploads/2024/06/Secours-Catholique-France-Logo-OK.png",
    url: "https://www.secours-catholique.org",
  },
  {
    name: "Plan International",
    logo_url:
      "https://caritasrwanda.org/wp-content/uploads/2023/04/Plan_International_Logo_blue-scaled.jpg",
    url: "https://plan-international.org/rwanda/",
  },
  {
    name: "UNHCR",
    logo_url: "https://caritasrwanda.org/wp-content/uploads/2022/09/UNHCR.png",
    url: "https://www.unhcr.org",
  },
  {
    name: "Ministry of Health Rwanda",
    logo_url:
      "https://caritasrwanda.org/wp-content/uploads/2022/09/Ministry-of-Health-of-rwanda.jpg",
    url: "https://www.moh.gov.rw",
  },
  {
    name: "World Vision",
    logo_url:
      "https://caritasrwanda.org/wp-content/uploads/2022/09/world-vision-vector-logo.png",
    url: "https://www.wvi.org",
  },
  {
    name: "PEPFAR",
    logo_url: "https://caritasrwanda.org/wp-content/uploads/2022/09/PEPFAR-LOGO-OK.jpg",
    url: "https://rw.usembassy.gov",
  },
  {
    name: "Caritas Slovenia",
    logo_url:
      "https://caritasrwanda.org/wp-content/uploads/2022/08/caritas_slovenia.png",
    url: "https://www.caritas.eu/caritas-slovenia/",
  },
  {
    name: "Catholic Relief Services",
    logo_url:
      "https://caritasrwanda.org/wp-content/uploads/2022/08/inter_crs-1.jpg",
    url: "https://www.crs.org",
  },
  {
    name: "Caritas Internationalis",
    logo_url:
      "https://caritasrwanda.org/wp-content/uploads/2022/08/inter_caritas_internationale-1.jpg",
    url: "https://www.caritas.org",
  },
];
