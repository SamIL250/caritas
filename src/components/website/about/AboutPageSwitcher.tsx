"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageHeroSection from "@/components/website/sections/PageHeroSection";

type QuickNavItem = {
  label: string;
  href: string;
  icon?: string;
};

type HeroProps = {
  eyebrow: string;
  heading: string;
  headingAccent?: string;
  subheading: string;
  imageUrl: string;
  breadcrumbLabel?: string;
};

type AboutPageSwitcherProps = {
  hero: HeroProps;
  quickNav: QuickNavItem[];
  panels: Record<string, React.ReactNode>;
};

function hrefToAnchor(href: string): string {
  return href.startsWith("#") ? href.slice(1) : href;
}

function readHashAnchor(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "").trim();
  return hash || null;
}

export default function AboutPageSwitcher({
  hero,
  quickNav,
  panels,
}: AboutPageSwitcherProps) {
  const validAnchors = useMemo(
    () =>
      quickNav
        .map((item) => hrefToAnchor(item.href))
        .filter((id) => Boolean(panels[id])),
    [quickNav, panels],
  );

  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  useEffect(() => {
    const hashAnchor = readHashAnchor();
    if (hashAnchor && validAnchors.includes(hashAnchor)) {
      setActiveAnchor(hashAnchor);
    }
  }, [validAnchors]);

  const handleSelect = useCallback(
    (href: string) => {
      const anchor = hrefToAnchor(href);
      if (!validAnchors.includes(anchor)) return;

      setActiveAnchor(anchor);

      const url = new URL(window.location.href);
      url.hash = anchor;
      window.history.replaceState(null, "", url.toString());

      requestAnimationFrame(() => {
        document
          .querySelector(".about-page-section-panel")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [validAnchors],
  );

  const activeHref = activeAnchor ? `#${activeAnchor}` : null;

  return (
    <div className="about-page-content">
      <PageHeroSection
        {...hero}
        quickNav={quickNav}
        quickNavMode="select"
        activeQuickNavHref={activeHref}
        onQuickNavSelect={handleSelect}
      />
      {activeAnchor && panels[activeAnchor] ? (
        <div className="about-page-section-panel" key={activeAnchor}>
          {panels[activeAnchor]}
        </div>
      ) : null}
    </div>
  );
}
