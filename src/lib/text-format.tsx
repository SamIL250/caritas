import React from "react";

/** Renders segments wrapped in ** as <strong>; keeps other text as fragments. */
export function formatInlineBold(text: string): React.ReactNode[] {
  if (!text) return [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((segment, i) => {
    const m = segment.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return <strong key={i}>{m[1]}</strong>;
    }
    return <React.Fragment key={i}>{segment}</React.Fragment>;
  });
}
