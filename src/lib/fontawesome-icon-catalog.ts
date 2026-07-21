/** Curated Font Awesome 6 solid icons for dashboard editors (copy as `fa-solid fa-*`). */

export type FontAwesomeIconEntry = {
  name: string;
  label: string;
};

export type FontAwesomeIconCategory = {
  id: string;
  label: string;
  icons: FontAwesomeIconEntry[];
};

export function formatFaSolidClass(name: string): string {
  const bare = name.replace(/^fa-solid\s+/i, "").replace(/^fa-/, "").trim();
  return bare ? `fa-solid fa-${bare}` : "fa-solid fa-circle";
}

export const FONT_AWESOME_ICON_CATEGORIES: FontAwesomeIconCategory[] = [
  {
    id: "programs",
    label: "Programs & mission",
    icons: [
      { name: "people-roof", label: "Social welfare" },
      { name: "heart-pulse", label: "Health" },
      { name: "seedling", label: "Development" },
      { name: "building-columns", label: "Admin & finance" },
      { name: "hand-holding-heart", label: "Charity" },
      { name: "hands-holding-heart", label: "Care" },
      { name: "hand-holding-dollar", label: "Donations" },
      { name: "handshake", label: "Partnership" },
      { name: "heart", label: "Heart" },
      { name: "bullseye", label: "Target" },
      { name: "chart-line", label: "Growth" },
      { name: "chart-bar", label: "Reports" },
      { name: "arrow-trend-up", label: "Impact" },
    ],
  },
  {
    id: "documents",
    label: "Documents & media",
    icons: [
      { name: "file-lines", label: "Document" },
      { name: "file-pdf", label: "PDF" },
      { name: "newspaper", label: "News" },
      { name: "book", label: "Book" },
      { name: "book-open", label: "Open book" },
      { name: "download", label: "Download" },
      { name: "upload", label: "Upload" },
      { name: "image", label: "Image" },
      { name: "images", label: "Gallery" },
      { name: "video", label: "Video" },
      { name: "microphone", label: "Audio" },
      { name: "folder", label: "Folder" },
      { name: "folder-open", label: "Open folder" },
      { name: "layer-group", label: "Categories" },
    ],
  },
  {
    id: "people",
    label: "People & community",
    icons: [
      { name: "people-group", label: "Community" },
      { name: "users", label: "Users" },
      { name: "user", label: "Person" },
      { name: "user-tie", label: "Leader" },
      { name: "person-chalkboard", label: "Secretary" },
      { name: "child-reaching", label: "Children" },
      { name: "house-chimney", label: "Household" },
      { name: "people-carry-box", label: "Volunteers" },
      { name: "crown", label: "Chairperson" },
    ],
  },
  {
    id: "faith",
    label: "Faith & values",
    icons: [
      { name: "church", label: "Church" },
      { name: "cross", label: "Cross" },
      { name: "hands-praying", label: "Prayer" },
      { name: "dove", label: "Peace" },
      { name: "star", label: "Star" },
      { name: "circle-check", label: "Check" },
      { name: "shield-halved", label: "Protection" },
      { name: "scale-balanced", label: "Justice" },
      { name: "landmark", label: "Institution" },
      { name: "mitre", label: "Bishop" },
    ],
  },
  {
    id: "contact",
    label: "Contact & location",
    icons: [
      { name: "location-dot", label: "Location" },
      { name: "map-location-dot", label: "Map pin" },
      { name: "map", label: "Map" },
      { name: "street-view", label: "Street view" },
      { name: "phone", label: "Phone" },
      { name: "envelope", label: "Email" },
      { name: "globe", label: "Website" },
      { name: "clock", label: "Hours" },
      { name: "calendar-days", label: "Calendar" },
    ],
  },
  {
    id: "ui",
    label: "Navigation & UI",
    icons: [
      { name: "arrow-right", label: "Arrow right" },
      { name: "arrow-left", label: "Arrow left" },
      { name: "arrow-up", label: "Arrow up" },
      { name: "arrow-up-right-from-square", label: "External link" },
      { name: "chevron-right", label: "Chevron right" },
      { name: "chevron-left", label: "Chevron left" },
      { name: "chevron-down", label: "Chevron down" },
      { name: "chevron-up", label: "Chevron up" },
      { name: "xmark", label: "Close" },
      { name: "plus", label: "Add" },
      { name: "magnifying-glass", label: "Search" },
      { name: "grid-2", label: "Grid" },
      { name: "grip", label: "Drag" },
      { name: "circle-info", label: "Info" },
      { name: "lock", label: "Lock" },
      { name: "eye", label: "View" },
      { name: "paper-plane", label: "Send" },
      { name: "link", label: "Link" },
      { name: "tag", label: "Tag" },
    ],
  },
];
