"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { NavMegaCategory } from "@/lib/nav-mega-menu-data";

const VIEWPORT_GUTTER = 16;

type Props = {
  menuKey: "news" | "publications";
  label: string;
  href: string;
  isActive: boolean;
  categories: NavMegaCategory[];
  isExpanded: boolean;
  onToggle: () => void;
  onCloseNav: () => void;
};

export default function NavMegaMenu({
  menuKey,
  label,
  href,
  isActive,
  categories,
  isExpanded,
  onToggle,
  onCloseNav,
}: Props) {
  const listId = useId();
  const itemRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? "");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const prevIndexRef = useRef(0);

  const activeCategory = categories.find((c) => c.id === activeId) ?? categories[0] ?? null;
  const visibleYearGroups =
    activeCategory && yearFilter === "all"
      ? activeCategory.yearGroups
      : (activeCategory?.yearGroups.filter((group) => group.year === yearFilter) ?? []);
  const activeItemCount = visibleYearGroups.reduce((sum, group) => sum + group.items.length, 0);
  const showYearFilter = (activeCategory?.years.length ?? 0) > 0;

  const positionDropdown = useCallback(() => {
    if (typeof window === "undefined" || window.innerWidth < 1024) return;

    const item = itemRef.current;
    const trigger = triggerRef.current;
    const dropdown = dropdownRef.current;
    const panel = dropdown?.querySelector<HTMLElement>(".nav-mega-panel");
    if (!item || !trigger || !dropdown || !panel) return;

    const itemRect = item.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const panelWidth = panel.offsetWidth;
    const triggerCenter = triggerRect.left + triggerRect.width / 2;

    let panelLeft = triggerCenter - panelWidth / 2;
    const maxLeft = window.innerWidth - panelWidth - VIEWPORT_GUTTER;
    panelLeft = Math.max(VIEWPORT_GUTTER, Math.min(panelLeft, maxLeft));

    const leftRelativeToItem = panelLeft - itemRect.left;
    dropdown.style.left = `${leftRelativeToItem}px`;
    dropdown.style.right = "auto";

    const arrowLeft = triggerCenter - panelLeft;
    panel.style.setProperty("--nav-mega-arrow-left", `${arrowLeft}px`);
  }, []);

  useEffect(() => {
    setYearFilter("all");
  }, [activeId]);

  useEffect(() => {
    if (!categories.length) return;
    if (!categories.some((c) => c.id === activeId)) {
      setActiveId(categories[0].id);
      prevIndexRef.current = 0;
    }
  }, [categories, activeId]);

  useEffect(() => {
    const item = itemRef.current;
    if (!item || typeof window === "undefined" || window.innerWidth < 1024) return;

    const run = () => positionDropdown();
    item.addEventListener("mouseenter", run);
    window.addEventListener("resize", run);

    return () => {
      item.removeEventListener("mouseenter", run);
      window.removeEventListener("resize", run);
    };
  }, [positionDropdown]);

  useEffect(() => {
    positionDropdown();
  }, [activeId, categories, positionDropdown]);

  const handleCategoryEnter = useCallback(
    (id: string) => {
      if (id === activeId) return;
      const prevIdx = categories.findIndex((c) => c.id === activeId);
      const nextIdx = categories.findIndex((c) => c.id === id);
      if (prevIdx >= 0 && nextIdx >= 0) {
        setSlideDir(nextIdx >= prevIdx ? "right" : "left");
        prevIndexRef.current = nextIdx;
      }
      setActiveId(id);
    },
    [activeId, categories],
  );

  return (
    <li
      ref={itemRef}
      className={["has-dropdown", "has-mega-dropdown", isExpanded ? "is-expanded" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="nav-item-row" ref={triggerRef}>
        <Link
          href={href}
          className={isActive ? "current" : ""}
          onClick={(e) => {
            if (window.innerWidth < 1024) {
              e.preventDefault();
              onToggle();
            } else {
              onCloseNav();
            }
          }}
        >
          {label} <ChevronDown size={14} className="nav-inline-caret inline-block ml-1 opacity-60" />
        </Link>
        <button
          type="button"
          className="nav-submenu-toggle"
          aria-expanded={isExpanded}
          aria-controls={listId}
          aria-label={`Toggle ${label} submenu`}
          onClick={onToggle}
        >
          <ChevronDown
            size={18}
            aria-hidden
            className={isExpanded ? "rotate-180 transition-transform" : "transition-transform"}
          />
        </button>
      </div>

      <div className="nav-dropdown nav-mega-dropdown" id={listId} ref={dropdownRef}>
        <div className="nav-mega-panel">
          <div className="nav-mega-sidebar" role="menu" aria-label={`${label} categories`}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                role="menuitem"
                className={`nav-mega-category${activeId === cat.id ? " is-active" : ""}`}
                onMouseEnter={() => handleCategoryEnter(cat.id)}
                onFocus={() => handleCategoryEnter(cat.id)}
                onClick={onCloseNav}
              >
                <span className="nav-mega-category-icon" aria-hidden>
                  <i className={`fa-solid ${cat.icon.replace(/^fa-solid\s+/i, "")}`} />
                </span>
                <span className="nav-mega-category-label">{cat.label}</span>
              </Link>
            ))}
            <Link href={href} className="nav-mega-view-all" onClick={onCloseNav}>
              View all {menuKey === "news" ? "news" : "publications"}
              <i className="fa-solid fa-arrow-right" aria-hidden />
            </Link>
          </div>

          <div
            className="nav-mega-preview"
            aria-live="polite"
            aria-label={activeCategory ? `Latest in ${activeCategory.label}` : "Latest items"}
          >
            {activeCategory ? (
              <div
                key={activeCategory.id}
                className={`nav-mega-preview-body nav-mega-preview-body--${slideDir}`}
              >
                <div className="nav-mega-preview-layout">
                  <div className="nav-mega-preview-main">
                    <div className="nav-mega-preview-head">
                      <p className="nav-mega-preview-eyebrow">Latest</p>
                      <h3 className="nav-mega-preview-title">{activeCategory.label}</h3>
                    </div>

                    {activeItemCount > 0 ? (
                      <div className="nav-mega-preview-years">
                        {visibleYearGroups.map((group) => (
                          <section key={group.year} className="nav-mega-preview-year">
                            {yearFilter === "all" ? (
                              <h4 className="nav-mega-preview-year-label">{group.year}</h4>
                            ) : null}
                            <ul className="nav-mega-preview-list">
                              {group.items.map((item) => (
                                <li key={item.id}>
                                  <Link href={item.href} className="nav-mega-preview-item" onClick={onCloseNav}>
                                    <div className="nav-mega-preview-thumb">
                                      {item.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.imageUrl} alt="" />
                                      ) : (
                                        <span className="nav-mega-preview-thumb-fallback" aria-hidden>
                                          <i className="fa-solid fa-file-lines" />
                                        </span>
                                      )}
                                    </div>
                                    <div className="nav-mega-preview-copy">
                                      <span className="nav-mega-preview-item-title">{item.title}</span>
                                      {item.dateLabel ? (
                                        <span className="nav-mega-preview-item-date">{item.dateLabel}</span>
                                      ) : null}
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    ) : (
                      <p className="nav-mega-preview-empty">
                        No published items in this section yet.
                      </p>
                    )}

                    <Link href={activeCategory.href} className="nav-mega-preview-more" onClick={onCloseNav}>
                      Browse {activeCategory.label}
                      <i className="fa-solid fa-arrow-right" aria-hidden />
                    </Link>
                  </div>

                  {showYearFilter ? (
                    <aside className="nav-mega-year-filter" aria-label="Filter by year">
                      <span className="nav-mega-year-filter-label">Year</span>
                      <button
                        type="button"
                        className={`nav-mega-year-filter-btn${yearFilter === "all" ? " is-active" : ""}`}
                        onClick={() => setYearFilter("all")}
                        aria-pressed={yearFilter === "all"}
                      >
                        All
                      </button>
                      {activeCategory.years.map((year) => (
                        <button
                          key={year}
                          type="button"
                          className={`nav-mega-year-filter-btn${yearFilter === year ? " is-active" : ""}`}
                          onClick={() => setYearFilter(year)}
                          aria-pressed={yearFilter === year}
                        >
                          {year}
                        </button>
                      ))}
                    </aside>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
