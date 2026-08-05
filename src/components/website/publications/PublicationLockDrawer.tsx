"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PublicationLockContent } from "./PublicationLockContent";

type Props = {
  publicationId: string;
  publicationTitle: string;
  isOpen: boolean;
  onUnlock: () => void;
  onClose: () => void;
};

export function PublicationLockDrawer({
  publicationId,
  publicationTitle,
  isOpen,
  onUnlock,
  onClose,
}: Props) {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setVisible(false), 380);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!visible) return null;

  return (
    <>
      <div
        className={`pub-drawer-backdrop${isOpen ? " open" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`pub-drawer-panel pub-lock-drawer${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Unlock publication"
      >
        <button className="pub-drawer-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="pub-drawer-content pub-lock-drawer-content">
          <PublicationLockContent
            publicationId={publicationId}
            publicationTitle={publicationTitle}
            onUnlock={onUnlock}
          />
        </div>
      </aside>
    </>
  );
}
