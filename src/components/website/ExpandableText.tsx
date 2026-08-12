"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

type Props = {
  text: string;
  /** Max lines when collapsed. Default 2. */
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
  moreLabel?: string;
  lessLabel?: string;
};

/**
 * Truncates long copy to ~N lines ending with “…”, with an inline “read more”
 * control beside the text (not a separate button below).
 */
export default function ExpandableText({
  text,
  lines = 2,
  className,
  style,
  moreLabel = "read more",
  lessLabel = "show less",
}: Props) {
  const raw = (text || "").trim();
  const measureRef = useRef<HTMLSpanElement>(null);
  const shellRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState<string | null>(null);
  const uid = useId();
  const contentId = `expandable-text-${uid.replace(/:/g, "")}`;

  useLayoutEffect(() => {
    setExpanded(false);
  }, [raw]);

  useLayoutEffect(() => {
    if (!raw || expanded) return;

    const measureEl = measureRef.current;
    const shell = shellRef.current;
    if (!measureEl || !shell) return;

    const compute = () => {
      const width = shell.clientWidth;
      if (width < 40) {
        setTruncated(null);
        return;
      }

      const cs = window.getComputedStyle(shell);
      const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
      const maxHeight = lineHeight * lines + 1;

      measureEl.style.width = `${width}px`;
      measureEl.textContent = raw;

      if (measureEl.scrollHeight <= maxHeight + 2) {
        setTruncated(null);
        return;
      }

      const suffix = `… ${moreLabel}`;
      let lo = 0;
      let hi = raw.length;
      let best = 0;

      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        // Prefer breaking near a word boundary
        let slice = raw.slice(0, mid).replace(/\s+\S*$/, "").trimEnd();
        if (!slice) slice = raw.slice(0, mid);
        measureEl.textContent = `${slice}${suffix}`;
        if (measureEl.scrollHeight <= maxHeight + 2) {
          best = slice.length;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      const out = raw.slice(0, best).replace(/\s+\S*$/, "").trimEnd() || raw.slice(0, best);
      setTruncated(out);
    };

    compute();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(compute) : null;
    ro?.observe(shell);
    window.addEventListener("resize", compute);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [raw, lines, moreLabel, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  if (!raw) return null;

  const needsToggle = truncated !== null;
  const showToggle = needsToggle || expanded;

  return (
    <div
      className={`cr-expandable${expanded ? " is-expanded" : ""}${needsToggle ? " has-toggle" : ""}${className ? ` ${className}` : ""}`}
      style={style}
    >
      {/* Hidden measurer mirrors text styles via CSS inheritance */}
      <span
        ref={measureRef}
        className="cr-expandable__measure cr-expandable__text"
        aria-hidden
      />
      <p ref={shellRef} id={contentId} className="cr-expandable__text">
        {expanded || !needsToggle ? raw : `${truncated}…`}
        {showToggle ? (
          <>
            {" "}
            <button
              type="button"
              className="cr-expandable__toggle"
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? lessLabel : moreLabel}
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}
