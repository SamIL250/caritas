/** CMS + defaults for `diocese_map_section` (reference: `index.html` Leaflet block). */

export type DioceseMapMarker = {
  /** Stable key for selection + markers */
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  archdiocese?: boolean;
  bishop?: string | null;
  founded?: string | null;
  description?: string;
  image?: string;
  phone?: string;
  website?: string;
};

export type DioceseMapSectionContent = {
  eyebrow: string;
  title_prefix: string;
  title_highlight: string;
  title_suffix: string;
  description: string;
  anchor_id: string;
  map_center_lat: number;
  map_center_lng: number;
  map_zoom: number;
  empty_hint: string;
  dioceses: DioceseMapMarker[];
};

export const DEFAULT_DIOCESE_MAP_SECTION_CONTENT: DioceseMapSectionContent = {
  eyebrow: "Diocesan Network",
  title_prefix: "Our",
  title_highlight: "9 Dioceses",
  title_suffix: "Across Rwanda",
  description:
    "Caritas Rwanda operates through 9 Diocesan Caritas, covering every corner of the country with faith-driven humanitarian service.",
  anchor_id: "network",
  map_center_lat: -1.94,
  map_center_lng: 29.87,
  map_zoom: 8,
  empty_hint: "Click a marker on the map or select a diocese from the list",
  dioceses: [
    {
      id: "kigali",
      name: "Archdiocese of Kigali",
      city: "Kigali",
      lat: -1.9441,
      lng: 30.0619,
      archdiocese: true,
      bishop: "Cardinal Antoine Kambanda",
      founded: "April 10, 1976",
      description:
        "The metropolitan see of Rwanda. The Cathedral of Notre-Dame des Victoires stands at the heart of the capital.",
      image: "/img/Diocese/Kabgayi_Basilica_Catholic_Church.jpg",
      phone: "+250 794 411 194",
      website: "https://archdioceseofkigali.org/",
    },
    {
      id: "kabgayi",
      name: "Diocese of Kabgayi",
      city: "Muhanga",
      lat: -2.0694,
      lng: 29.7553,
      bishop: "Mgr. Balthazar Ntivuguruzwa",
      founded: "February 14, 1952",
      description:
        "Home to the historic Kabgayi Basilica, one of the oldest and most significant Catholic centres in Rwanda.",
      image: "/img/Diocese/Kabgayi_Basilica_Catholic_Church.jpg",
      phone: "+250 788 633 463",
      website: "http://www.diocesekabgayi.org/",
    },
    {
      id: "butare",
      name: "Diocese of Butare",
      city: "Huye",
      lat: -2.5966,
      lng: 29.7418,
      bishop: "Mgr. Jean Bosco Ntagungira",
      founded: "December 20, 1960",
      description: "Serving the southern Rwanda region, centred in the university city of Huye (Butare).",
      image: "/img/Diocese/caption.jpg",
      phone: "+250 788 303 720",
      website: "https://butarecatholicdiocese.com/",
    },
    {
      id: "byumba",
      name: "Diocese of Byumba",
      city: "Gicumbi",
      lat: -1.5769,
      lng: 30.0633,
      bishop: "Mgr. Papias Musengamana",
      founded: "November 14, 1981",
      description: "Covering the northern highlands of Rwanda, centred in Byumba (Gicumbi district).",
      image: "/img/Diocese/BYumba.jpg",
      phone: "+250 788 676 620",
      website: "https://byumbadiocese.org/",
    },
    {
      id: "cyangugu",
      name: "Diocese of Cyangugu",
      city: "Rusizi",
      lat: -2.4847,
      lng: 28.907,
      bishop: "Mgr. Edouard Sinayobye",
      founded: "November 5, 1981",
      description: "Located in southwestern Rwanda on the shores of Lake Kivu, serving the Rusizi area.",
      image: "/img/Diocese/cyangugu.jpg",
      phone: "+250 788 308 810",
      website: "https://www.diocesecyangugu.com/",
    },
    {
      id: "gikongoro",
      name: "Diocese of Gikongoro",
      city: "Nyamagabe",
      lat: -2.4786,
      lng: 29.5642,
      bishop: null,
      founded: "March 30, 1992",
      description: "Covering the hilly terrain of southern-western Rwanda in the Nyamagabe district.",
      image: "/img/Diocese/cropped-Cathedrale-Diocese-Gikongoro-BG-1-scaled-7.jpg",
      phone: "+250 535 077",
      website: "https://www.diocesegikongoro.com/",
    },
    {
      id: "kibungo",
      name: "Diocese of Kibungo",
      city: "Ngoma",
      lat: -2.1489,
      lng: 30.5485,
      bishop: null,
      founded: "September 5, 1968",
      description: "Serving the eastern region of Rwanda, centred in Kibungo (Ngoma district).",
      image: "/img/Diocese/Capture.PNG",
      phone: "+250 789 589 308",
      website: "https://www.diocesekibungo.com/",
    },
    {
      id: "nyundo",
      name: "Diocese of Nyundo",
      city: "Rubavu",
      lat: -1.6786,
      lng: 29.3947,
      bishop: "H.E. Mgr. Anaclet Mwumvaneza",
      founded: "November 10, 1959",
      description:
        "Covering the northwest of Rwanda along Lake Kivu, centred in Rubavu (Gisenyi).",
      image:
        "/img/Diocese/WhatsApp%20Image%202025-10-16%20at%2012.47.37_785f3d99.jpg",
      phone: "+250 782 188 862",
      website: "http://www.nyundodiocese.info/",
    },
    {
      id: "ruhengeri",
      name: "Diocese of Ruhengeri",
      city: "Musanze",
      lat: -1.4986,
      lng: 29.6318,
      bishop: "Mgr. Vincent Harolimana",
      founded: "September 11, 1961",
      description:
        "Nestled at the foot of the Virunga volcanoes, serving northern Rwanda from Musanze.",
      image: "/img/Diocese/Cathedrale_Fatima_Ruhengeri.jpg",
      phone: "+250 788 742 632",
      website: "https://www.dioceseruhengeri.org/",
    },
  ],
};

export function normalizeDioceseMapContent(
  raw: Partial<DioceseMapSectionContent> | null | undefined,
): DioceseMapSectionContent {
  const base = DEFAULT_DIOCESE_MAP_SECTION_CONTENT;
  if (!raw || typeof raw !== "object") return { ...base, dioceses: [...base.dioceses] };
  const list =
    Array.isArray(raw.dioceses) && raw.dioceses.length > 0 ? raw.dioceses : base.dioceses;
  const dioceses: DioceseMapMarker[] = list.map((d: DioceseMapMarker, i: number) => ({
    id: typeof d.id === "string" && d.id.trim() ? d.id.trim() : `diocese-${i + 1}`,
    name: typeof d.name === "string" ? d.name : "",
    city: typeof d.city === "string" ? d.city : "",
    lat: Number.isFinite(Number(d.lat)) ? Number(d.lat) : 0,
    lng: Number.isFinite(Number(d.lng)) ? Number(d.lng) : 0,
    archdiocese: Boolean(d.archdiocese),
    bishop: d.bishop ?? null,
    founded: d.founded ?? null,
    description: typeof d.description === "string" ? d.description : "",
    image: typeof d.image === "string" ? d.image : "",
    phone: typeof d.phone === "string" ? d.phone : "",
    website: typeof d.website === "string" ? d.website : "",
  }));
  return {
    ...base,
    ...raw,
    eyebrow: typeof raw.eyebrow === "string" ? raw.eyebrow : base.eyebrow,
    title_prefix: typeof raw.title_prefix === "string" ? raw.title_prefix : base.title_prefix,
    title_highlight:
      typeof raw.title_highlight === "string" ? raw.title_highlight : base.title_highlight,
    title_suffix: typeof raw.title_suffix === "string" ? raw.title_suffix : base.title_suffix,
    description: typeof raw.description === "string" ? raw.description : base.description,
    anchor_id: typeof raw.anchor_id === "string" ? raw.anchor_id : base.anchor_id,
    map_center_lat: Number.isFinite(Number(raw.map_center_lat))
      ? Number(raw.map_center_lat)
      : base.map_center_lat,
    map_center_lng: Number.isFinite(Number(raw.map_center_lng))
      ? Number(raw.map_center_lng)
      : base.map_center_lng,
    map_zoom: Number.isFinite(Number(raw.map_zoom)) ? Number(raw.map_zoom) : base.map_zoom,
    empty_hint: typeof raw.empty_hint === "string" ? raw.empty_hint : base.empty_hint,
    dioceses,
  };
}
