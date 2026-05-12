"use client";

import { useEffect } from "react";

const LOADER_SELECTOR = 'script[data-google-translate-loader="1"]';

/**
 * Loads Google Translate’s widget in a hidden mount so the page (including DB-backed copy)
 * can be translated client-side. Language changes go through {@link applyTranslateLocale}.
 *
 * Inline scripts cannot use Next `<Script>` with children under React 19 (console warning /
 * scripts never executed from React-owned `<script>`). We inject the loader + callback via DOM APIs instead.
 */
export function GoogleTranslateBootstrap() {
  useEffect(() => {
    type TranslateCtor = new (
      options: { pageLanguage: string; layout: number; autoDisplay: boolean },
      containerId: string,
    ) => unknown;

    type TranslateNs = {
      TranslateElement: TranslateCtor & { InlineLayout: { SIMPLE: number } };
    };

    const w = window as Window & {
      __initGoogleTranslate?: () => void;
      google?: { translate?: TranslateNs };
    };

    w.__initGoogleTranslate = function __initGoogleTranslate() {
      try {
        const mount = document.getElementById("google_translate_element");
        if (!mount) return;
        const t = w.google?.translate;
        if (!t?.TranslateElement) return;
        const TE = t.TranslateElement;
        new TE(
          {
            pageLanguage: "en",
            layout: TE.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element",
        );
      } catch {
        /* ignore */
      }
    };

    if (!document.querySelector(LOADER_SELECTOR)) {
      const script = document.createElement("script");
      script.dataset.googleTranslateLoader = "1";
      script.async = true;
      script.src = "https://translate.google.com/translate_a/element.js?cb=__initGoogleTranslate";
      document.body.appendChild(script);
    } else if (w.google?.translate) {
      queueMicrotask(() => w.__initGoogleTranslate?.());
    }
  }, []);

  return (
    <div
      id="google_translate_element"
      className="google-translate-mount notranslate"
      aria-hidden
      suppressHydrationWarning
    />
  );
}
