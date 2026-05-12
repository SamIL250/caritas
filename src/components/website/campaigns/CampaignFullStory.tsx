"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Collapsed viewport height (px) before user expands */
const COLLAPSED_PX = 360;
/** Each "Show more" adds this much visible height until the full HTML is shown */
const EXPAND_BY_PX = 280;

export function CampaignFullStory({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fullHeight, setFullHeight] = useState(0);
  const [visibleMax, setVisibleMax] = useState(COLLAPSED_PX);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setFullHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [html]);

  const needsToggle = fullHeight > COLLAPSED_PX + 32;
  const isFullyExpanded = !needsToggle || visibleMax >= fullHeight - 2;
  const effectiveMax = isFullyExpanded ? undefined : visibleMax;

  const expandsRemaining =
    needsToggle && !isFullyExpanded
      ? Math.max(1, Math.ceil((fullHeight - visibleMax) / EXPAND_BY_PX))
      : 0;

  if (!html.trim()) {
    return (
      <section aria-labelledby="campaign-full-story-heading" className="campaign-full-story-section">
        <hr className="campaign-full-story-rule" />
        <h2 id="campaign-full-story-heading" className="campaign-full-story-heading">
          Full story
        </h2>
        <p className="campaign-full-story-empty">More about this campaign will be posted here soon.</p>
      </section>
    );
  }

  function showMore() {
    setVisibleMax((v) => Math.min(v + EXPAND_BY_PX, fullHeight));
  }

  function showLess() {
    setVisibleMax(COLLAPSED_PX);
  }

  return (
    <section aria-labelledby="campaign-full-story-heading" className="campaign-full-story-section min-w-0">
      <hr className="campaign-full-story-rule" />
      <h2 id="campaign-full-story-heading" className="campaign-full-story-heading">
        Full story
      </h2>
      <div className="campaign-full-story-inner">
        <div className="campaign-full-story-expand-wrap">
          <div
            ref={ref}
            className={`donation-campaign-prose campaign-full-story-html max-w-none ${
              needsToggle && !isFullyExpanded ? "overflow-hidden" : ""
            }`}
            style={effectiveMax !== undefined ? { maxHeight: effectiveMax } : undefined}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div
            className={`campaign-full-story-fade ${needsToggle && !isFullyExpanded ? "" : "is-hidden"}`}
            aria-hidden
          />
        </div>
        {needsToggle ? (
          <div className="campaign-full-story-toggle-row">
            {!isFullyExpanded ? (
              <button
                type="button"
                onClick={showMore}
                className="campaign-story-btn-more"
                aria-expanded={false}
                aria-label={
                  expandsRemaining > 1
                    ? `Show more of the story. About ${expandsRemaining} more steps until the full text is visible.`
                    : "Show more of the story"
                }
              >
                Show more
                <i className="fa-solid fa-chevron-down text-xs" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={showLess}
                className="campaign-story-link-less"
                aria-expanded={true}
              >
                Show less
                <i className="fa-solid fa-chevron-up text-xs" aria-hidden />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
