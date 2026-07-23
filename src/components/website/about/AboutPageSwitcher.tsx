"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import PageHeroSection from "@/components/website/sections/PageHeroSection";
import { ABOUT_SECTION_NAV, hrefToAboutAnchor } from "@/lib/about-section-nav";

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
  return hrefToAboutAnchor(href);
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
  const pathname = usePathname();

  const validAnchors = useMemo(
    () =>
      ABOUT_SECTION_NAV.map((item) => hrefToAboutAnchor(item.href)).filter((id) =>
        Boolean(panels[id]),
      ),
    [panels],
  );

  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  const syncFromHash = useCallback(() => {
    const hashAnchor = readHashAnchor();
    if (hashAnchor && validAnchors.includes(hashAnchor)) {
      setActiveAnchor(hashAnchor);
      requestAnimationFrame(() => {
        document
          .querySelector(".about-page-section-panel")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    if (!hashAnchor) {
      setActiveAnchor(null);
    }
  }, [validAnchors]);

  useEffect(() => {
    if (pathname !== "/about") return;
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [pathname, syncFromHash]);

  const handleSelect = useCallback(
    (href: string) => {
      const anchor = hrefToAnchor(href);
      if (!validAnchors.includes(anchor)) return;

      const url = new URL(window.location.href);
      url.hash = anchor;
      window.history.replaceState(null, "", url.toString());
      syncFromHash();
    },
    [validAnchors, syncFromHash],
  );

  const handleGoBack = useCallback(() => {
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", url.toString());
    setActiveAnchor(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (activeAnchor) {
      document.body.classList.add("about-section-active");
    } else {
      document.body.classList.remove("about-section-active");
    }
    return () => document.body.classList.remove("about-section-active");
  }, [activeAnchor]);

  const activeHref = activeAnchor ? `#${activeAnchor}` : null;

  return (
    <div className="about-page-content">
      <PageHeroSection
        {...hero}
        quickNav={quickNav}
        quickNavHint="Unfold"
        quickNavMode="select"
        activeQuickNavHref={activeHref}
        onQuickNavSelect={handleSelect}
      />
      {activeAnchor && panels[activeAnchor] ? (
        <div className="about-page-section-panel" key={activeAnchor}>
          {panels[activeAnchor]}
          <div className="about-page-section-actions">
            <button
              type="button"
              className="about-page-go-back"
              onClick={handleGoBack}
            >
              <i className="fa-solid fa-arrow-left" aria-hidden />
              Go back
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
