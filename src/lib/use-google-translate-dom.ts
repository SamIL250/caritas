"use client";

import { useSyncExternalStore } from "react";

function domTranslateActive(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.documentElement;
  return el.classList.contains("translated-ltr") || el.classList.contains("translated-rtl");
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const html = document.documentElement;
  const obs = new MutationObserver(() => {
    onStoreChange();
  });
  obs.observe(html, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * True after Google Translate has rewritten the live DOM (adds `translated-ltr` / `translated-rtl` on `<html>`).
 * Framer Motion exit animations conflict with those mutations — gate animations off when this is true.
 */
export function useGoogleTranslateDomActive(): boolean {
  return useSyncExternalStore(subscribe, domTranslateActive, getServerSnapshot);
}
