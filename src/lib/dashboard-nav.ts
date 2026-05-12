/**
 * Active nav state for dashboard sidebar.
 * `/dashboard` must not match every route that starts with `/dashboard` (e.g. `/dashboard/settings`).
 */
export function isDashboardNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const p = pathname.replace(/\/$/, "") || "/";
  const h = href.replace(/\/$/, "") || "/";

  if (h === "/dashboard") {
    return p === "/dashboard";
  }

  return p === h || p.startsWith(`${h}/`);
}
