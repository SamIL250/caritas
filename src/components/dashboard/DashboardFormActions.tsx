"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: ReactNode;
  /** Must match the parent `<form id="…">` so submit works when portaled. */
  formId: string;
  /** `stretch` — full-width buttons (news). `end` — right-aligned (publications). */
  align?: "stretch" | "end";
};

/**
 * Fixed save/cancel bar for long dashboard forms.
 * Portaled to document.body so it is not trapped by dashboard shell transforms.
 */
export function DashboardFormActions({ children, formId, align = "stretch" }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bar = (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-stone-200/90 bg-white/95 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:left-64"
      role="group"
      aria-label="Form actions"
      data-form-id={formId}
    >
      <div
        className={`mx-auto flex w-full max-w-[80rem] gap-3 px-4 sm:px-6 lg:px-8 ${
          align === "end" ? "justify-end" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );

  return (
    <>
      <div className="h-[4.75rem] shrink-0 sm:h-20" aria-hidden />
      {mounted && typeof document !== "undefined" ? createPortal(bar, document.body) : null}
    </>
  );
}
