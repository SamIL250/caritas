/** About page section tabs — shared by hero quick nav and site header dropdown. */
export const ABOUT_SECTION_NAV = [
  {
    label: "Our History",
    href: "#history",
    icon: "fa-clock-rotate-left",
  },
  {
    label: "VISION, MISSION & VALUES",
    href: "/#about-us",
    icon: "fa-bullseye",
  },
  {
    label: "Our Network",
    href: "#network",
    icon: "fa-network-wired",
  },
  {
    label: "Leadership",
    href: "#leadership",
    icon: "fa-user-tie",
  },
] as const;

export function aboutSectionPath(href: string): string {
  if (href.startsWith("/")) return href;
  return href.startsWith("#") ? `/about${href}` : `/about#${href}`;
}

export function hrefToAboutAnchor(href: string): string {
  if (href.startsWith("#")) return href.slice(1);
  const hashIndex = href.indexOf("#");
  return hashIndex >= 0 ? href.slice(hashIndex + 1) : href;
}
