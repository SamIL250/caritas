"use client";

import Link from "next/link";
import { useDonation } from "@/context/DonationContext";

export function CampaignPrimaryActions({
  primaryLabel,
  primaryUrl,
  campaignId,
  donationsEnabled = true,
  className,
}: {
  primaryLabel: string;
  primaryUrl: string;
  campaignId?: string | null;
  donationsEnabled?: boolean;
  className?: string;
}) {
  const { openModal } = useDonation();
  const url = (primaryUrl || "").trim() || "#donate";

  const cls =
    className ??
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#8c2208] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#6f1a06]";

  if (url === "#donate") {
    if (!donationsEnabled) {
      return (
        <button
          type="button"
          disabled
          className={cls}
          title="Online donations are not enabled for this campaign right now."
        >
          <i className="fa-solid fa-heart" aria-hidden />
          {primaryLabel}
        </button>
      );
    }
    return (
      <button type="button" className={cls} onClick={() => openModal(campaignId ?? null)}>
        <i className="fa-solid fa-heart" aria-hidden />
        {primaryLabel}
      </button>
    );
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return (
      <a href={url} className={cls} target="_blank" rel="noopener noreferrer">
        <i className="fa-solid fa-arrow-up-right-from-square text-xs opacity-90" aria-hidden />
        {primaryLabel}
      </a>
    );
  }
  return (
    <Link href={url.startsWith("/") ? url : `/${url}`} className={cls}>
      <i className="fa-solid fa-arrow-right text-xs opacity-90" aria-hidden />
      {primaryLabel}
    </Link>
  );
}
