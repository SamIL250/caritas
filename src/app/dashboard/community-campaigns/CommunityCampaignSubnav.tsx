"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard/community-campaigns", label: "Campaigns" },
  { href: "/dashboard/community-campaigns/categories", label: "Categories" },
  { href: "/dashboard/community-campaigns/comments", label: "Comment moderation" },
] as const;

export function CommunityCampaignSubnav() {
  const pathname = usePathname().replace(/\/$/, "") || "/";

  function campaignsTabActive(): boolean {
    if (pathname.startsWith("/dashboard/community-campaigns/categories")) return false;
    if (pathname.startsWith("/dashboard/community-campaigns/comments")) return false;
    return pathname.startsWith("/dashboard/community-campaigns");
  }

  return (
    <nav
      className="mb-6 flex flex-wrap border-b border-stone-200"
      aria-label="Community campaigns sections"
    >
      {links.map(({ href, label }) => {
        const h = href.replace(/\/$/, "") || "/";
        const active =
          href === "/dashboard/community-campaigns"
            ? campaignsTabActive()
            : pathname === h || pathname.startsWith(`${h}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
              active
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
