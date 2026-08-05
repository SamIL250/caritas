"use client";

import { useState, useEffect } from "react";
import { PublicationLockPage } from "@/components/website/publications/PublicationLockPage";

type Props = {
  publicationId: string;
  isLocked: boolean;
  publicationTitle: string;
  categoryLabel?: string;
  excerpt?: string;
  coverImageUrl?: string;
  children: React.ReactNode;
};

export function PublicationDetailWrapper({
  publicationId,
  isLocked,
  publicationTitle,
  categoryLabel,
  excerpt,
  coverImageUrl,
  children,
}: Props) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!isLocked) {
      setUnlocked(true);
      return;
    }
    try {
      const val = localStorage.getItem(`pub_unlocked_${publicationId}`);
      if (val === "1") setUnlocked(true);
    } catch {
      /* ignore */
    }
  }, [publicationId, isLocked]);

  if (!isLocked || unlocked) {
    return <>{children}</>;
  }

  return (
    <PublicationLockPage
      publicationId={publicationId}
      publicationTitle={publicationTitle}
      categoryLabel={categoryLabel}
      excerpt={excerpt}
      coverImageUrl={coverImageUrl}
      onUnlock={() => setUnlocked(true)}
    />
  );
}
