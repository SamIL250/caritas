"use client";

import { useState, useEffect } from "react";
import { PublicationPasswordGate } from "@/components/website/publications/PublicationPasswordGate";

type Props = {
  publicationId: string;
  isLocked: boolean;
  publicationTitle: string;
  children: React.ReactNode;
};

export function PublicationDetailWrapper({ publicationId, isLocked, publicationTitle, children }: Props) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!isLocked) {
      setUnlocked(true);
      return;
    }
    try {
      const val = localStorage.getItem(`pub_unlocked_${publicationId}`);
      if (val === "1") setUnlocked(true);
    } catch {}
  }, [publicationId, isLocked]);

  if (!isLocked || unlocked) {
    return <>{children}</>;
  }

  return (
    <PublicationPasswordGate
      publicationId={publicationId}
      publicationTitle={publicationTitle}
      onUnlock={() => setUnlocked(true)}
    />
  );
}
