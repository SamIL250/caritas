"use client";

import type { PublicationRow } from "@/lib/publications";
import { PublicationLockDrawer } from "./PublicationLockDrawer";

type Props = {
  publication: PublicationRow | null;
  onUnlock: () => void;
  onClose: () => void;
};

export function PublicationLockModal({ publication, onUnlock, onClose }: Props) {
  if (!publication) return null;

  return (
    <PublicationLockDrawer
      publicationId={publication.id}
      publicationTitle={publication.title}
      isOpen={Boolean(publication)}
      onUnlock={onUnlock}
      onClose={onClose}
    />
  );
}
