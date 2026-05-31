export type Partner = {
  name: string;
  logo_url: string;
  url?: string;
};

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
    logo_url: "/img/Plan logo NEW.jpg.jpeg",
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
    logo_url: "/img/WV Rwanda primary logo_2025.png",
    url: "https://www.wvi.org",
  },
  {
    name: "Bridges Outcomes",
    logo_url: "/img/Bridges-Outcomes-Partnerships_logo.png",
    url: "https://www.bridges-outcomes.com",
  },
  {
    name: "European Commission",
    logo_url: "/img/eiei.jpeg",
    url: "https://www.ec.europa.eu",
  },
  {
    name: "Slovenia Aid",
    logo_url: "/img/Slovenia Aid and Partnership logo.png",
    url: "https://www.sloveniaaid.si",
  },
  {
    name: "PEPFAR",
    logo_url: "https://caritasrwanda.org/wp-content/uploads/2022/09/PEPFAR-LOGO-OK.jpg",
    url: "https://www.pepfar.gov",
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
    logo_url: "/img/Caritas_Internationalis_SVG_logo.svg.png",
    url: "https://www.caritas.org",
  },
  {
    name: "Rwanda Biomedical Centre",
    logo_url: "/img/RBC logo.png",
    url: "https://www.rbc.gov.rw",
  },
  {
    name: "JHPIEGO",
    logo_url: "/img/JHPIEGO.png",
    url: "https://www.jhpiego.org",
  },
  {
    name: "Denmark — Danida",
    logo_url: "/img/Denmark.png",
    url: "https://um.dk/en/danida",
  },
  {
    name: "Education Outcomes Fund",
    logo_url: "/img/EOF logo.png",
    url: "https://educationoutcomesfund.org",
  },
  {
    name: "BUFMAR",
    logo_url: "/img/BUFMAR-Circle-logo.png",
    url: "https://www.bufmar.rw",
  },
  {
    name: "Coalition for Hepatitis Elimination",
    logo_url: "/img/Coalition for Global Hepatitis Elimination.png",
    url: "https://www.coalitionforhepatitis.org",
  },
  {
    name: "EAiD",
    logo_url: "/img/Ethical Artificial Intelligence for Human Development  EAiD.png",
    url: "https://eaid.org",
  },
];
